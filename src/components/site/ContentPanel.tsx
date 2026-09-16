import { useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Pencil, Plus, Save, Trash2 } from "lucide-react";
import {
  deleteSitePost,
  saveSitePost,
  saveSiteSettings,
  uploadSiteAsset,
  type SitePost,
  type SiteSettings,
} from "@/lib/db";
import { site } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const defaultSettings: Partial<SiteSettings> = {
  company_name: site.name,
  tagline: site.tagline,
  phone: site.phone,
  email: site.email,
  address: site.address,
  facebook_url: site.facebook,
  instagram_url: site.instagram,
};

const emptyPost: Partial<SitePost> = {
  kind: "news",
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  publish_date: new Date().toISOString().slice(0, 10),
  published: true,
};

export function ContentPanel({
  settings,
  posts,
  onSaved,
}: {
  settings?: SiteSettings | null | undefined;
  posts: SitePost[];
  onSaved: () => void;
}) {
  const [settingsForm, setSettingsForm] = useState<Partial<SiteSettings>>({
    ...defaultSettings,
    ...settings,
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [post, setPost] = useState<Partial<SitePost> | null>(null);
  const [postImage, setPostImage] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<SitePost | null>(null);

  function setSetting(key: keyof SiteSettings, value: string) {
    setSettingsForm((current) => ({ ...current, [key]: value }));
  }

  async function saveSettings() {
    setBusy(true);
    try {
      const logoUrl = logo
        ? await uploadSiteAsset(logo, "logo")
        : (settingsForm.logo_url ?? null);
      await saveSiteSettings({ ...settingsForm, logo_url: logoUrl });
      toast.success("Site information updated.");
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update site information.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function removeListImage(item: SitePost) {
    try {
      await saveSitePost({ ...item, image_url: null });
      toast.success("Cover image removed");
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not remove image",
      );
    }
  }

  async function savePost() {
    if (!post?.title || !post.slug || !post.excerpt || !post.kind) {
      toast.error("Kind, title, slug and summary are required.");
      return;
    }
    setBusy(true);
    try {
      const imageUrl = postImage
        ? await uploadSiteAsset(postImage, "content")
        : (post.image_url ?? null);
      await saveSitePost({ ...post, image_url: imageUrl });
      toast.success("Content published.");
      setPost(null);
      setPostImage(null);
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save content.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company information &amp; logo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {(
            [
              "company_name",
              "tagline",
              "phone",
              "email",
              "address",
              "facebook_url",
              "instagram_url",
            ] as const
          ).map((key) => (
            <div
              key={key}
              className={
                key === "address" || key === "tagline"
                  ? "space-y-1.5 sm:col-span-2"
                  : "space-y-1.5"
              }
            >
              <Label>{key.replace("_", " ")}</Label>
              {key === "address" || key === "tagline" ? (
                <Textarea
                  value={String(settingsForm[key] ?? "")}
                  onChange={(event) => setSetting(key, event.target.value)}
                />
              ) : (
                <Input
                  value={String(settingsForm[key] ?? "")}
                  onChange={(event) => setSetting(key, event.target.value)}
                />
              )}
            </div>
          ))}
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="flex items-center gap-2">
              <ImagePlus className="h-4 w-4" /> Logo
            </Label>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-background p-1">
                {logo ? (
                  <img
                    src={URL.createObjectURL(logo)}
                    alt="New logo preview"
                    className="h-full w-full object-contain"
                  />
                ) : settingsForm.logo_url ? (
                  <img
                    src={settingsForm.logo_url}
                    alt="Current logo"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No logo
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setLogo(event.target.files?.[0] ?? null)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {logo
                    ? `${logo.name} — will replace the logo everywhere it appears (navbar, footer, sign-in pages, admin sidebar) once saved.`
                    : "Upload a new file to replace the current logo."}
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="signal"
            onClick={() => void saveSettings()}
            disabled={busy}
            className="w-fit"
          >
            <Save className="h-4 w-4" /> Save site information
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>News, blogs &amp; incoming equipment</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Publish updates that appear in the homepage updates section.
            </p>
          </div>
          <Button
            variant="signal"
            onClick={() => {
              setPost({ ...emptyPost });
              setPostImage(null);
            }}
          >
            <Plus className="h-4 w-4" /> New update
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {posts.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="group relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-secondary">
                  {item.image_url ? (
                    <>
                      <img
                        src={item.image_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        title="Remove image"
                        onClick={() => void removeListImage(item)}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-signal">
                    <span>{item.kind}</span>
                    <span className="text-muted-foreground">
                      {item.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-1 font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.excerpt}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setPost({ ...item })}
                  aria-label="Edit update"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setPendingDelete(item)}
                  aria-label="Delete update"
                >
                  <Trash2 className="h-4 w-4 text-signal" />
                </Button>
              </div>
            </div>
          ))}
          {!posts.length && (
            <p className="text-sm text-muted-foreground">
              No updates yet. Create the first company news, blog post or
              incoming equipment announcement.
            </p>
          )}
        </CardContent>
      </Card>

      {post && (
        <Card className="border-signal">
          <CardHeader>
            <CardTitle>{post.id ? "Edit update" : "New update"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Content type</Label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={post.kind ?? "news"}
                onChange={(event) =>
                  setPost({
                    ...post,
                    kind: event.target.value as SitePost["kind"],
                  })
                }
              >
                <option value="news">Company news</option>
                <option value="blog">Blog / field note</option>
                <option value="incoming">Incoming equipment</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Publish date</Label>
              <Input
                type="date"
                value={post.publish_date ?? ""}
                onChange={(event) =>
                  setPost({ ...post, publish_date: event.target.value })
                }
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Title *</Label>
              <Input
                value={post.title ?? ""}
                onChange={(event) =>
                  setPost({ ...post, title: event.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slug *</Label>
              <Input
                value={post.slug ?? ""}
                onChange={(event) =>
                  setPost({ ...post, slug: event.target.value })
                }
                placeholder="new-equipment-arriving"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cover image</Label>
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-secondary">
                  {postImage ? (
                    <img
                      src={URL.createObjectURL(postImage)}
                      alt="New cover preview"
                      className="h-full w-full object-cover"
                    />
                  ) : post.image_url ? (
                    <img
                      src={post.image_url}
                      alt="Current cover"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setPostImage(event.target.files?.[0] ?? null)
                    }
                  />
                  {post.image_url && !postImage && (
                    <button
                      type="button"
                      onClick={() => setPost({ ...post, image_url: null })}
                      className="text-xs text-signal hover:underline"
                    >
                      Remove current cover image
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Link (optional)</Label>
              <Input
                type="url"
                value={post.link_url ?? ""}
                onChange={(event) =>
                  setPost({ ...post, link_url: event.target.value || null })
                }
                placeholder="https://example.com/announcement"
              />
              <p className="text-xs text-muted-foreground">
                If set, clicking this update on the site opens this link
                directly instead of just showing the summary.
              </p>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Summary *</Label>
              <Textarea
                value={post.excerpt ?? ""}
                onChange={(event) =>
                  setPost({ ...post, excerpt: event.target.value })
                }
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Full post</Label>
              <Textarea
                rows={5}
                value={post.body ?? ""}
                onChange={(event) =>
                  setPost({ ...post, body: event.target.value })
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={post.published ?? true}
                onChange={(event) =>
                  setPost({ ...post, published: event.target.checked })
                }
              />{" "}
              Publish on the public site
            </label>
            <div className="flex gap-3 sm:col-span-2">
              <Button
                variant="signal"
                onClick={() => void savePost()}
                disabled={busy}
              >
                <Save className="h-4 w-4" /> Save update
              </Button>
              <Button variant="outline" onClick={() => setPost(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.title ?? "this update"}"?`}
        description="This permanently removes it from the site's news, blog and incoming-equipment section. This cannot be undone."
        confirmLabel="Delete update"
        onConfirm={async () => {
          if (pendingDelete) {
            await deleteSitePost(pendingDelete.id);
            onSaved();
          }
        }}
      />
    </section>
  );
}
