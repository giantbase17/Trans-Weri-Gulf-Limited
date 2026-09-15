-- Lead-handling workflow: a schedulable follow-up date per enquiry, plus
-- indexes for the new dashboard/filtering queries.
ALTER TABLE public.enquiries
ADD COLUMN IF NOT EXISTS next_action_date date;

CREATE INDEX IF NOT EXISTS enquiries_next_action_date_idx ON public.enquiries(next_action_date);
CREATE INDEX IF NOT EXISTS enquiries_assigned_to_idx ON public.enquiries(assigned_to);
CREATE INDEX IF NOT EXISTS enquiries_status_idx ON public.enquiries(status);
