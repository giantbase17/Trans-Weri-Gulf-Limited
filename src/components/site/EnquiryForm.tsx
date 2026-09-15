import { useState, useRef } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { createEnquiry, type Equipment } from "@/lib/db";
import { site, whatsappLink } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(30),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(200)
    .or(z.literal("")),
  company: z.string().trim().max(160).optional(),
  project_location: z.string().trim().max(200).optional(),
  inquiry_type: z.enum(["rental", "sale", "both"]),
  rental_period: z.string().max(40).optional(),
  budget_range: z.string().max(100).optional(),
  quantity: z.string().optional(),
  start_date: z.string().max(20).optional(),
  end_date: z.string().max(20).optional(),
  message: z.string().trim().max(1500).optional(),
});

export function EnquiryForm({ equipment }: { equipment?: Equipment | null }) {
  const [submitting, setSubmitting] = useState(false);
  const [period, setPeriod] = useState("Daily");
  const [inquiryType, setInquiryType] = useState<"rental" | "sale" | "both">("rental");
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const raw = {
      full_name: String(form.get("full_name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      company: String(form.get("company") ?? ""),
      project_location: String(form.get("project_location") ?? ""),
      inquiry_type: inquiryType,
      rental_period: period,
      budget_range: String(form.get("budget_range") ?? ""),
      quantity: String(form.get("quantity") ?? "1"),
      start_date: String(form.get("start_date") ?? ""),
      end_date: String(form.get("end_date") ?? ""),
      message: String(form.get("message") ?? ""),
    };

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }

    setSubmitting(true);
    try {
      await createEnquiry({
        full_name: parsed.data.full_name,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        company: parsed.data.company || null,
        project_location: parsed.data.project_location || null,
        rental_period: period,
        message: parsed.data.message || null,
        start_date: raw.start_date || null,
        end_date: raw.end_date || null,
        equipment_id: equipment?.id ?? null,
        equipment_name: equipment?.name ?? "General enquiry",
        quantity: parseInt(parsed.data.quantity ?? "1") || 1,
        transaction_type: inquiryType,
      });

      setDone(true);
      toast.success("Enquiry received — our team will contact you shortly.");
      e.currentTarget.reset();
    } catch {
      toast.error(
        "Could not send your enquiry. Please call or WhatsApp us instead.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Generate WhatsApp message with all form details
  function generateWhatsAppMessage(form: FormData) {
    const fields = {
      'Name': String(form.get("full_name") ?? ""),
      'Phone': String(form.get("phone") ?? ""),
      'Email': String(form.get("email") ?? ""),
      'Company': String(form.get("company") ?? ""),
      'Location': String(form.get("project_location") ?? ""),
      'Type': inquiryType,
      'Rental Period': period,
      'Budget': String(form.get("budget_range") ?? ""),
      'Quantity': String(form.get("quantity") ?? "1"),
      'Start Date': String(form.get("start_date") ?? ""),
      'End Date': String(form.get("end_date") ?? ""),
      'Date': new Date().toLocaleDateString(),
      'Equipment': equipment?.name || 'General enquiry',
      'Message': String(form.get("message") ?? ""),
    };
    
    const message = `Hello ${site.name}, I'd like to make a ${inquiryType === 'sale' ? 'purchase' : 'rental'} enquiry.\n\n` + 
      Object.entries(fields)
        .filter(([_, value]) => value.trim())
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    
    return message;
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Full name *</Label>
          <Input
            id="full_name"
            name="full_name"
            required
            maxLength={120}
            placeholder="Jane Doe"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone / WhatsApp *</Label>
          <Input
            id="phone"
            name="phone"
            required
            maxLength={30}
            placeholder="0801 234 5678"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            maxLength={200}
            placeholder="you@company.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            name="company"
            maxLength={160}
            placeholder="Company / organisation"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="project_location">Project location</Label>
          <Input
            id="project_location"
            name="project_location"
            maxLength={200}
            placeholder="Yenagoa, Bayelsa"
          />
        </div>
        <div className="space-y-1.5">
          <Label>I'm interested in</Label>
          <Select value={inquiryType} onValueChange={(value: any) => setInquiryType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rental">Equipment Rental</SelectItem>
              <SelectItem value="sale">Equipment Purchase</SelectItem>
              <SelectItem value="both">Both Rental & Purchase</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(inquiryType === "rental" || inquiryType === "both") && (
          <div className="space-y-1.5">
            <Label>Rental period</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Daily", "Weekly", "Monthly", "Project-based"].map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {(inquiryType === "sale" || inquiryType === "both") && (
          <div className="space-y-1.5">
            <Label htmlFor="budget_range">Budget range (optional)</Label>
            <Input
              id="budget_range"
              name="budget_range"
              placeholder="e.g. 5M - 10M NGN"
              maxLength={100}
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            defaultValue="1"
            placeholder="Number of units"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="start_date">Start date</Label>
          <Input id="start_date" name="start_date" type="date" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end_date">End date</Label>
          <Input id="end_date" name="end_date" type="date" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Details</Label>
        <Textarea
          id="message"
          name="message"
          rows={4}
          maxLength={1500}
          placeholder={
            equipment
              ? `Tell us about your ${equipment.name} requirement…`
              : "Tell us which machines you need and for how long…"
          }
        />
      </div>

      {done && (
        <p className="rounded-md bg-accent px-4 py-3 text-sm text-accent-foreground">
          Enquiry logged. For an instant response you can also message us on
          WhatsApp.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="signal" size="lg" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {equipment?.quote_only ? "Request Quote" : "Send Enquiry"}
        </Button>
        <Button asChild variant="field" size="lg">
          <a
            href={whatsappLink(generateWhatsAppMessage(new FormData(formRef.current || document.createElement('form'))))}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp Instead
          </a>
        </Button>
      </div>
    </form>
  );
}
