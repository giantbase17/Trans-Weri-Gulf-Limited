import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Mail, MessageCircle, Phone, Send } from "lucide-react";
import { createEnquiry, fetchEquipmentList, type Equipment } from "@/lib/db";
import {
  ALL_SERVICE_TYPES,
  SERVICE_LABELS,
  site,
  whatsappLink,
  type ServiceType,
} from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ContactMethod = "whatsapp" | "email" | "phone";

const CONTACT_LABELS: Record<ContactMethod, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
  phone: "Phone call",
};

const CONTACT_ACTION_LABELS: Record<ContactMethod, string> = {
  whatsapp: "Send via WhatsApp",
  email: "Send via Email",
  phone: "Request a Phone Call",
};

const EQUIPMENT_SERVICE_TYPES: ServiceType[] = [
  "equipment_rental",
  "equipment_purchase",
];

interface FormValues {
  full_name: string;
  phone: string;
  email: string;
  company: string;
  project_location: string;
  budget_range: string;
  quantity: string;
  message: string;
}

function formatLongDate(value: string | Date) {
  const d = typeof value === "string" ? new Date(`${value}T00:00:00`) : value;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Whole-day span between two yyyy-mm-dd dates, e.g. 7 Sep → 21 Sep = 14. */
function calcDurationDays(start: string, end: string): number | null {
  if (!start || !end) return null;
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  const diff = Math.round((e.getTime() - s.getTime()) / 86_400_000);
  return diff >= 0 ? diff : null;
}

export function EnquiryForm({ equipment }: { equipment?: Equipment | null }) {
  const [submitting, setSubmitting] = useState(false);
  const [period, setPeriod] = useState("Daily");
  const [serviceType, setServiceType] = useState<ServiceType>(
    "equipment_rental",
  );
  const [contactMethod, setContactMethod] = useState<ContactMethod>("whatsapp");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(
    equipment?.id ?? "",
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const { data: equipmentOptions } = useQuery({
    queryKey: ["equipment", "public"],
    queryFn: fetchEquipmentList,
    enabled: !equipment,
  });

  const isEquipmentEnquiry = EQUIPMENT_SERVICE_TYPES.includes(serviceType);
  const isRental = serviceType === "equipment_rental";
  const isPurchase = serviceType === "equipment_purchase";
  const selectedEquipment = isEquipmentEnquiry
    ? (equipment ??
      equipmentOptions?.find((e) => e.id === selectedEquipmentId) ??
      null)
    : null;
  const duration = calcDurationDays(startDate, endDate);

  function readForm(form: HTMLFormElement): FormValues {
    const fd = new FormData(form);
    return {
      full_name: String(fd.get("full_name") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      company: String(fd.get("company") ?? "").trim(),
      project_location: String(fd.get("project_location") ?? "").trim(),
      budget_range: String(fd.get("budget_range") ?? "").trim(),
      quantity: String(fd.get("quantity") ?? "1").trim(),
      message: String(fd.get("message") ?? "").trim(),
    };
  }

  function handleReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = readForm(event.currentTarget);
    if (values.full_name.length < 2) {
      toast.error("Enter your full name");
      return;
    }
    if (values.phone.length < 7) {
      toast.error("Enter a valid phone number");
      return;
    }
    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) {
      toast.error("Enter a valid email");
      return;
    }
    if (isEquipmentEnquiry && !selectedEquipment) {
      toast.error("Select the equipment you're asking about");
      return;
    }
    if (isRental) {
      if (!startDate || !endDate) {
        toast.error("Select a rental start and end date");
        return;
      }
      if (duration === null) {
        toast.error("End date must be on or after the start date");
        return;
      }
    }
    if (!isEquipmentEnquiry && !values.message) {
      toast.error("Tell us a bit about what you need");
      return;
    }
    setPendingValues(values);
  }

  function buildMessage(values: FormValues) {
    const lines = [`${SERVICE_LABELS[serviceType]} Inquiry`, "", `Name: ${values.full_name}`];
    if (values.company) lines.push(`Company: ${values.company}`);
    lines.push(`Phone: ${values.phone}`);
    if (values.email) lines.push(`Email: ${values.email}`);
    lines.push("");

    if (isEquipmentEnquiry) {
      lines.push(
        `Equipment${isRental ? " Required" : ""}: ${selectedEquipment?.name ?? "General enquiry"}`,
      );
      lines.push(`Quantity: ${values.quantity || "1"}`);
      if (isPurchase && values.budget_range) {
        lines.push(`Budget: ${values.budget_range}`);
      }
      if (isRental) {
        if (values.project_location) {
          lines.push(`Project Location: ${values.project_location}`);
        }
        lines.push("");
        lines.push(`Rental Start Date: ${formatLongDate(startDate)}`);
        lines.push(`Rental End Date: ${formatLongDate(endDate)}`);
        if (duration !== null) lines.push(`Duration: ${duration} Days`);
        lines.push("");
        lines.push("Additional Notes:");
        lines.push(values.message || "—");
      } else {
        lines.push("");
        lines.push("Message:");
        lines.push(values.message || "—");
      }
    } else {
      lines.push("Message:");
      lines.push(values.message || "—");
    }

    lines.push("");
    lines.push(`Inquiry Date: ${formatLongDate(new Date())}`);
    return lines.join("\n");
  }

  async function confirmAndSend() {
    if (!pendingValues) return;
    setSubmitting(true);
    // Open the tab synchronously, inside the click handler, before any
    // `await` — browsers drop the "user gesture" trust (and silently block
    // the popup) once window.open() happens after an awaited async call.
    // Deliberately omitting "noopener"/"noreferrer" here: per spec, either
    // one makes window.open() return null instead of a window handle, which
    // would leave this tab permanently blank since we navigate it below
    // only after the enquiry save resolves.
    const whatsappWindow =
      contactMethod === "whatsapp" ? window.open("", "_blank") : null;
    try {
      await createEnquiry({
        full_name: pendingValues.full_name,
        phone: pendingValues.phone,
        email: pendingValues.email || null,
        company: pendingValues.company || null,
        project_location:
          isRental ? pendingValues.project_location || null : null,
        rental_period: isRental ? period : null,
        message: pendingValues.message || null,
        start_date: isRental ? startDate || null : null,
        end_date: isRental ? endDate || null : null,
        equipment_id: selectedEquipment?.id ?? null,
        equipment_name: isEquipmentEnquiry
          ? (selectedEquipment?.name ?? "General enquiry")
          : SERVICE_LABELS[serviceType],
        quantity: parseInt(pendingValues.quantity || "1", 10) || 1,
        transaction_type: isPurchase
          ? "purchase"
          : isRental
            ? "rental"
            : "rental",
        service_type: serviceType,
        preferred_contact: contactMethod,
      });

      const message = buildMessage(pendingValues);
      if (contactMethod === "whatsapp") {
        if (whatsappWindow) {
          whatsappWindow.location.href = whatsappLink(message);
        } else {
          // Popup was blocked before we could even open a blank tab — try
          // once more (may still be blocked, but better than nothing).
          window.open(whatsappLink(message), "_blank", "noreferrer");
        }
        toast.success("Enquiry logged — opening WhatsApp…");
      } else if (contactMethod === "email") {
        const subject = encodeURIComponent(
          `${SERVICE_LABELS[serviceType]} Inquiry`,
        );
        window.location.href = `mailto:${site.email}?subject=${subject}&body=${encodeURIComponent(message)}`;
        toast.success("Enquiry logged — opening your email app…");
      } else {
        toast.success("Enquiry logged — our team will call you shortly.");
      }

      setDone(true);
      setPendingValues(null);
      formRef.current?.reset();
      setStartDate("");
      setEndDate("");
    } catch {
      whatsappWindow?.close();
      toast.error(
        "Could not send your enquiry. Please call or WhatsApp us instead.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const reviewing = !!pendingValues;
  const typeOptions = equipment ? EQUIPMENT_SERVICE_TYPES : ALL_SERVICE_TYPES;

  return (
    <form ref={formRef} onSubmit={handleReview} className="space-y-4">
      <fieldset disabled={reviewing} className="space-y-4 disabled:opacity-60">
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

          <div className="space-y-1.5 sm:col-span-2">
            <Label>What do you need? *</Label>
            <Select
              value={serviceType}
              onValueChange={(value: ServiceType) => setServiceType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((value) => (
                  <SelectItem key={value} value={value}>
                    {SERVICE_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isEquipmentEnquiry && (
            <>
              {equipment ? (
                <div className="space-y-1.5">
                  <Label>Equipment</Label>
                  <Input value={equipment.name} disabled readOnly />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="equipment_id">Equipment *</Label>
                  <Select
                    value={selectedEquipmentId}
                    onValueChange={setSelectedEquipmentId}
                  >
                    <SelectTrigger id="equipment_id">
                      <SelectValue placeholder="Select the machine you need" />
                    </SelectTrigger>
                    <SelectContent>
                      {(equipmentOptions ?? []).map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isRental && (
                <div className="space-y-1.5">
                  <Label htmlFor="project_location">Project location</Label>
                  <Input
                    id="project_location"
                    name="project_location"
                    maxLength={200}
                    placeholder="Yenagoa, Bayelsa"
                  />
                </div>
              )}

              {isRental && (
                <div className="space-y-1.5">
                  <Label>Rental period</Label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Daily", "Weekly", "Monthly", "Project-based"].map(
                        (p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {isPurchase && (
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

              {isRental && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="start_date">Rental start date *</Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="end_date">Rental end date *</Label>
                    <Input
                      id="end_date"
                      name="end_date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                  {startDate && endDate && (
                    <p className="sm:col-span-2 -mt-1 text-sm font-semibold text-sky-700">
                      {duration !== null
                        ? `Duration: ${duration} Day${duration === 1 ? "" : "s"}`
                        : "End date must be on or after the start date"}
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Preferred contact method</Label>
          <RadioGroup
            value={contactMethod}
            onValueChange={(v: ContactMethod) => setContactMethod(v)}
            className="grid gap-2 sm:grid-cols-3"
          >
            {(
              [
                ["whatsapp", MessageCircle],
                ["email", Mail],
                ["phone", Phone],
              ] as const
            ).map(([value, Icon]) => (
              <label
                key={value}
                htmlFor={`contact_${value}`}
                className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm font-medium has-[:checked]:border-sky-500 has-[:checked]:bg-sky-50"
              >
                <RadioGroupItem value={value} id={`contact_${value}`} />
                <Icon className="h-4 w-4 text-sky-600" />
                {CONTACT_LABELS[value]}
              </label>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="message">
            {isRental
              ? "Additional notes"
              : isEquipmentEnquiry
                ? "Message"
                : "Tell us what you need *"}
          </Label>
          <Textarea
            id="message"
            name="message"
            rows={4}
            maxLength={1500}
            required={!isEquipmentEnquiry}
            placeholder={
              selectedEquipment
                ? `Tell us about your ${selectedEquipment.name} requirement…`
                : isEquipmentEnquiry
                  ? "Tell us which machines you need and for how long…"
                  : `Tell us about your ${SERVICE_LABELS[serviceType].toLowerCase()} requirement…`
            }
          />
        </div>
      </fieldset>

      {pendingValues && (
        <div className="space-y-3 rounded-lg border border-sky-300 bg-sky-50 p-4 text-sm">
          <p className="font-bold text-sky-800">
            {SERVICE_LABELS[serviceType]} Summary
          </p>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {isEquipmentEnquiry && (
              <>
                <p>
                  <span className="text-muted-foreground">Equipment: </span>
                  {selectedEquipment?.name}
                </p>
                <p>
                  <span className="text-muted-foreground">Quantity: </span>
                  {pendingValues.quantity || "1"}
                </p>
              </>
            )}
            {isRental && (
              <>
                <p>
                  <span className="text-muted-foreground">Start Date: </span>
                  {formatLongDate(startDate)}
                </p>
                <p>
                  <span className="text-muted-foreground">End Date: </span>
                  {formatLongDate(endDate)}
                </p>
                <p className="sm:col-span-2">
                  <span className="text-muted-foreground">Duration: </span>
                  {duration} Day{duration === 1 ? "" : "s"}
                </p>
              </>
            )}
            <p className="sm:col-span-2">
              <span className="text-muted-foreground">
                Preferred Contact:{" "}
              </span>
              {CONTACT_LABELS[contactMethod]}
            </p>
          </div>
        </div>
      )}

      {done && (
        <p className="rounded-md bg-accent px-4 py-3 text-sm text-accent-foreground">
          Enquiry logged. Our team will be in touch shortly.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {!pendingValues ? (
          <Button
            type="submit"
            size="lg"
            className="rounded-full border-0 bg-gradient-to-r from-sky-600 to-sky-500 font-bold uppercase tracking-wide text-white hover:brightness-110"
          >
            <Send className="h-4 w-4" />
            Review Inquiry
          </Button>
        ) : (
          <>
            <Button
              type="button"
              size="lg"
              disabled={submitting}
              onClick={confirmAndSend}
              className="rounded-full border-0 bg-gradient-to-r from-sky-600 to-sky-500 font-bold uppercase tracking-wide text-white hover:brightness-110"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Confirm — {CONTACT_ACTION_LABELS[contactMethod]}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={submitting}
              onClick={() => setPendingValues(null)}
              className="rounded-full"
            >
              Edit
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
