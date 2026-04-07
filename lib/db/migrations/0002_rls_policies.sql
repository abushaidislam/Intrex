-- Migration: Enable RLS and create tenant isolation policies
-- Note: Using custom JWT auth, so we create app-level tenant context functions

-- Enable RLS on all tenant-owned tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obligation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obligation_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obligation_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ssl_check_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create function to check if user belongs to tenant (for API/service role usage)
-- Since we use custom JWT, RLS policies will be permissive for service role
-- and restrictive based on tenant_id for authenticated users

-- Tenants: Users can only see their own tenant
CREATE POLICY "tenant_isolation_select" ON public.tenants
  FOR SELECT USING (
    id IN (SELECT tenant_id FROM public.users WHERE id = current_setting('app.current_user_id')::int)
  );

CREATE POLICY "tenant_isolation_update" ON public.tenants
  FOR UPDATE USING (
    id IN (SELECT tenant_id FROM public.users WHERE id = current_setting('app.current_user_id')::int)
  );

-- Users: Can only see users in same tenant
CREATE POLICY "users_tenant_select" ON public.users
  FOR SELECT USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid OR
    id = current_setting('app.current_user_id')::int
  );

CREATE POLICY "users_tenant_update" ON public.users
  FOR UPDATE USING (
    id = current_setting('app.current_user_id')::int
  );

-- Branches: Can only access branches in same tenant
CREATE POLICY "branches_tenant_select" ON public.branches
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "branches_tenant_insert" ON public.branches
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "branches_tenant_update" ON public.branches
  FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "branches_tenant_delete" ON public.branches
  FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Obligation Templates
CREATE POLICY "templates_tenant_select" ON public.obligation_templates
  FOR SELECT USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid OR tenant_id IS NULL
  );

CREATE POLICY "templates_tenant_modify" ON public.obligation_templates
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Obligation Instances
CREATE POLICY "obligations_tenant_select" ON public.obligation_instances
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "obligations_tenant_insert" ON public.obligation_instances
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "obligations_tenant_update" ON public.obligation_instances
  FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "obligations_tenant_delete" ON public.obligation_instances
  FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Obligation Documents (through obligation_instances)
CREATE POLICY "documents_tenant_select" ON public.obligation_documents
  FOR SELECT USING (
    obligation_instance_id IN (
      SELECT id FROM public.obligation_instances 
      WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
    )
  );

CREATE POLICY "documents_tenant_modify" ON public.obligation_documents
  FOR ALL USING (
    obligation_instance_id IN (
      SELECT id FROM public.obligation_instances 
      WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
    )
  );

-- Domains
CREATE POLICY "domains_tenant_select" ON public.domains
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "domains_tenant_modify" ON public.domains
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- SSL Check Results
CREATE POLICY "ssl_results_tenant_select" ON public.ssl_check_results
  FOR SELECT USING (
    domain_id IN (
      SELECT id FROM public.domains 
      WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
    )
  );

-- Connectors
CREATE POLICY "connectors_tenant_select" ON public.connectors
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "connectors_tenant_modify" ON public.connectors
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Notification Routes
CREATE POLICY "routes_tenant_select" ON public.notification_routes
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "routes_tenant_modify" ON public.notification_routes
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Notification Events
CREATE POLICY "events_tenant_select" ON public.notification_events
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "events_tenant_modify" ON public.notification_events
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Notification Deliveries
CREATE POLICY "deliveries_tenant_select" ON public.notification_deliveries
  FOR SELECT USING (
    notification_event_id IN (
      SELECT id FROM public.notification_events 
      WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
    )
  );

-- Acknowledgements
CREATE POLICY "ack_tenant_select" ON public.acknowledgements
  FOR SELECT USING (
    notification_event_id IN (
      SELECT id FROM public.notification_events 
      WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
    )
  );

-- Activity Logs
CREATE POLICY "logs_tenant_select" ON public.activity_logs
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "logs_tenant_insert" ON public.activity_logs
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Service role bypass for API operations (used when RLS context not set)
CREATE OR REPLACE FUNCTION public.check_service_role() RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user is postgres/service role (bypass RLS)
  RETURN (current_user = 'postgres' OR current_user LIKE 'supabase%');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Jurisdictions: Read-only for all (system data)
CREATE POLICY "jurisdictions_select" ON public.jurisdictions
  FOR SELECT USING (true);
