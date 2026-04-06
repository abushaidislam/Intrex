import tls from 'tls';
import net from 'net';
import crypto from 'crypto';

export interface SSLCheckOptions {
  hostname: string;
  port: number;
  sniHostname?: string;
  timeout?: number;
}

export interface SSLCertificateInfo {
  validFrom: string;
  validTo: string;
  issuerCN: string;
  subjectCN: string;
  san: string[];
  fingerprint: string;
  serialNumber: string;
}

export interface SSLCheckResult {
  certificate?: SSLCertificateInfo;
  error?: string;
  raw?: Record<string, any>;
}

/**
 * Check SSL certificate for a given hostname and port
 */
export function checkSSLCertificate(options: SSLCheckOptions): Promise<SSLCheckResult> {
  return new Promise((resolve) => {
    const { hostname, port, sniHostname, timeout = 30000 } = options;
    const targetHost = sniHostname || hostname;

    const socket = new net.Socket();
    let resolved = false;

    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        try {
          socket.destroy();
        } catch (e) {
          // ignore
        }
      }
    };

    // Set connection timeout
    const timeoutId = setTimeout(() => {
      cleanup();
      resolve({
        error: 'Connection timeout',
        raw: { hostname, port, timeout },
      });
    }, timeout);

    socket.on('error', (error) => {
      clearTimeout(timeoutId);
      cleanup();
      resolve({
        error: error.message,
        raw: { hostname, port, error: error.message, code: (error as any).code },
      });
    });

    socket.on('timeout', () => {
      clearTimeout(timeoutId);
      cleanup();
      resolve({
        error: 'Socket timeout',
        raw: { hostname, port },
      });
    });

    try {
      socket.connect(port, hostname, () => {
        // Wrap the socket with TLS
        const tlsSocket = tls.connect({
          socket,
          servername: targetHost,
          rejectUnauthorized: false, // We want to check expired/self-signed certs too
        }, () => {
          clearTimeout(timeoutId);

          try {
            const certificate = tlsSocket.getPeerCertificate(true);
            
            if (!certificate || Object.keys(certificate).length === 0) {
              cleanup();
              tlsSocket.end();
              resolve({
                error: 'No certificate received',
                raw: { hostname, port },
              });
              return;
            }

            // Extract SAN (Subject Alternative Names)
            const san: string[] = [];
            if (certificate.subjectaltname) {
              // Parse format: "DNS:example.com, DNS:www.example.com, IP:1.2.3.4"
              const sanEntries = certificate.subjectaltname.split(',');
              for (const entry of sanEntries) {
                const match = entry.trim().match(/^(DNS|IP Address|IP):(.*)$/i);
                if (match) {
                  san.push(match[2]);
                }
              }
            }

            // Calculate fingerprint
            const rawCert = certificate.raw;
            const fingerprint = rawCert 
              ? crypto.createHash('sha256').update(rawCert).digest('hex').toUpperCase().replace(/(.{2})/g, '$1:').slice(0, -1)
              : '';

            const certInfo: SSLCertificateInfo = {
              validFrom: certificate.valid_from,
              validTo: certificate.valid_to,
              issuerCN: certificate.issuer?.CN || '',
              subjectCN: certificate.subject?.CN || '',
              san,
              fingerprint,
              serialNumber: certificate.serialNumber || '',
            };

            cleanup();
            tlsSocket.end();

            resolve({
              certificate: certInfo,
              raw: {
                hostname,
                port,
                subject: certificate.subject,
                issuer: certificate.issuer,
                serialNumber: certificate.serialNumber,
                valid_from: certificate.valid_from,
                valid_to: certificate.valid_to,
                subjectaltname: certificate.subjectaltname,
                fingerprint,
              },
            });
          } catch (error) {
            clearTimeout(timeoutId);
            cleanup();
            tlsSocket.end();
            resolve({
              error: error instanceof Error ? error.message : 'Certificate parsing error',
              raw: { hostname, port },
            });
          }
        });

        tlsSocket.on('error', (error) => {
          clearTimeout(timeoutId);
          cleanup();
          resolve({
            error: `TLS handshake failed: ${error.message}`,
            raw: { hostname, port, error: error.message, code: (error as any).code },
          });
        });
      });
    } catch (error) {
      clearTimeout(timeoutId);
      cleanup();
      resolve({
        error: error instanceof Error ? error.message : 'Connection failed',
        raw: { hostname, port, error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  });
}

/**
 * Check if a hostname matches a certificate's CN or SAN
 */
export function matchHostname(hostname: string, cn: string, san: string[]): boolean {
  // Check exact match in SAN
  if (san.includes(hostname)) {
    return true;
  }

  // Check wildcard matches
  for (const sanEntry of san) {
    if (sanEntry.startsWith('*.')) {
      const wildcardDomain = sanEntry.slice(2);
      const hostnameParts = hostname.split('.');
      const wildcardParts = wildcardDomain.split('.');
      
      if (hostnameParts.length > wildcardParts.length) {
        const hostnameBase = hostnameParts.slice(1).join('.');
        if (hostnameBase === wildcardDomain) {
          return true;
        }
      }
    }
  }

  // Check CN match
  if (cn === hostname) {
    return true;
  }

  return false;
}

/**
 * Calculate days remaining until certificate expiry
 */
export function getDaysRemaining(validTo: string | Date): number {
  const expiryDate = typeof validTo === 'string' ? new Date(validTo) : validTo;
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Determine SSL check status based on certificate state
 */
export function determineCheckStatus(
  daysRemaining: number,
  hostnameMatch: boolean
): 'ok' | 'warning' | 'expired' | 'hostname_mismatch' {
  if (!hostnameMatch) {
    return 'hostname_mismatch';
  }
  if (daysRemaining < 0) {
    return 'expired';
  }
  if (daysRemaining <= 30) {
    return 'warning';
  }
  return 'ok';
}
