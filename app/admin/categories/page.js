import Link from "next/link";

import {
  bulkUpdateCategoryStatusAction,
  deleteCategoryAction,
  deleteServiceAction,
  saveCategoryAction,
  saveServiceAction,
} from "@/app/admin/actions";
import { getCategoryAnalytics, listCategories } from "@/lib/db";

import {
  EmptyState,
  Field,
  MetricCard,
  PageHeader,
  SectionHeader,
  SelectField,
  StatusBadge,
  Textarea,
  ToastBanner,
} from "../_components";

export const dynamic = "force-dynamic";

function dash(value) {
  return value ?? "—";
}

function CategoryFields({ category }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <input type="hidden" name="id" value={category?.id || ""} />
      <Field label="Category name" name="name" defaultValue={category?.name || ""} />
      <Field label="Slug" name="slug" defaultValue={category?.slug || ""} />
      <Textarea
        label="Description"
        name="description"
        defaultValue={category?.description || ""}
        rows={3}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Color"
          name="color"
          defaultValue={category?.color || ""}
          placeholder="#1197a0"
        />
        <Field
          label="Icon"
          name="icon"
          defaultValue={category?.icon || ""}
          placeholder="spark"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Display order"
          name="displayOrder"
          type="number"
          defaultValue={category?.displayOrder ?? 0}
        />
        <SelectField
          label="Status"
          name="status"
          defaultValue={category?.status || "active"}
          options={[
            { value: "active", label: "Active" },
            { value: "archived", label: "Archived" },
          ]}
        />
      </div>
    </div>
  );
}

function ServiceFields({ service, categoryId }) {
  return (
    <div className="grid gap-4">
      <input type="hidden" name="id" value={service?.id || ""} />
      <input type="hidden" name="categoryId" value={categoryId} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Service name" name="name" defaultValue={service?.name || ""} />
        <Field label="Slug" name="slug" defaultValue={service?.slug || ""} />
      </div>
      <Textarea
        label="Description"
        name="description"
        defaultValue={service?.description || ""}
        rows={3}
      />
      <Textarea
        label="Ideal for"
        name="idealFor"
        defaultValue={service?.idealFor || ""}
        rows={3}
      />
      <Textarea
        label="Deliverables"
        name="deliverables"
        defaultValue={service?.deliverables || ""}
        rows={3}
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_120px_180px]">
        <Field label="CTA" name="cta" defaultValue={service?.cta || ""} />
        <Field
          label="Order"
          name="displayOrder"
          type="number"
          defaultValue={service?.displayOrder ?? 0}
        />
        <SelectField
          label="Status"
          name="status"
          defaultValue={service?.status || "active"}
          options={[
            { value: "active", label: "Active" },
            { value: "archived", label: "Archived" },
          ]}
        />
      </div>
    </div>
  );
}

export default async function AdminCategoriesPage({ searchParams }) {
  const query = await searchParams;
  const [{ categories, services }, categoryOptions] = await Promise.all([
    getCategoryAnalytics(),
    listCategories({ includeArchived: true }),
  ]);
  const activeCategories = categories.filter((category) => category.status === "active");

  return (
    <div className="space-y-8">
      <ToastBanner toast={query?.toast} error={query?.error} />

      <PageHeader
        title="Categories"
        description="Create, organize, archive, and reorder the service categories that drive the portfolio structure."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Categories" value={categories.length} />
        <MetricCard
          label="Active categories"
          value={activeCategories.length}
          trend="Visible in the public services navigation"
        />
        <MetricCard label="Services" value={services.length} />
        <MetricCard
          label="Active services"
          value={services.filter((service) => service.status === "active").length}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)]">
        <div className="admin-panel bg-white p-5 sm:p-6">
          <SectionHeader title="Create new category" />
          <form action={saveCategoryAction} className="space-y-5">
            <input type="hidden" name="redirectTo" value="/admin/categories" />
            <CategoryFields />
            <div className="flex justify-end">
              <button type="submit" className="admin-button admin-button-primary">
                Create category
              </button>
            </div>
          </form>
        </div>

        <div className="admin-panel bg-white p-5 sm:p-6">
          <SectionHeader title="Bulk manage categories" />
          {categories.length ? (
            <form action={bulkUpdateCategoryStatusAction} className="space-y-5">
              <input type="hidden" name="redirectTo" value="/admin/categories" />
              <div className="grid gap-3">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center justify-between gap-4 rounded-[14px] border border-black/8 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <input type="checkbox" name="categoryIds" value={category.id} className="size-4" />
                      <div>
                        <p className="text-sm font-medium text-[#202938]">{category.name}</p>
                        <p className="text-xs text-black/48">
                          {category.analytics?.servicesCount || 0} services
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={category.status} />
                  </label>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="submit"
                  name="status"
                  value="active"
                  className="admin-button admin-button-secondary"
                >
                  Mark active
                </button>
                <button
                  type="submit"
                  name="status"
                  value="archived"
                  className="admin-button admin-button-secondary"
                >
                  Archive selected
                </button>
              </div>
            </form>
          ) : (
            <EmptyState
              title="No categories yet."
              description="Create your first category to start organizing services."
            />
          )}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader title="Category management" />

        {categories.length ? (
          categories.map((category) => (
            <article
              key={category.id}
              id={`category-${category.slug}`}
              className="admin-panel space-y-6 bg-white p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="admin-kicker">Category</p>
                  <h2 className="mt-2 text-2xl font-['PP_Neue_Montreal'] tracking-[-0.05em] text-[#202938]">
                    {category.name}
                  </h2>
                  {category.description ? (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-black/58">
                      {category.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={category.status} />
                  <Link href={`/admin/analytics#category-${category.slug}`} className="text-sm text-[#1699a3]">
                    View analytics
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 border-t border-black/8 pt-4 sm:grid-cols-4">
                <div>
                  <p className="admin-kicker">Services</p>
                  <p className="mt-2 text-sm text-[#202938]">{category.analytics?.servicesCount || 0}</p>
                </div>
                <div>
                  <p className="admin-kicker">Projects</p>
                  <p className="mt-2 text-sm text-[#202938]">{dash(category.analytics?.projectCount)}</p>
                </div>
                <div>
                  <p className="admin-kicker">Inquiries</p>
                  <p className="mt-2 text-sm text-[#202938]">{dash(category.analytics?.inquiryCount)}</p>
                </div>
                <div>
                  <p className="admin-kicker">Avg. time spent</p>
                  <p className="mt-2 text-sm text-[#202938]">{dash(category.analytics?.avgTimeSpent)}</p>
                </div>
              </div>

              <form action={saveCategoryAction} className="space-y-5 border-t border-black/8 pt-5">
                <input type="hidden" name="redirectTo" value="/admin/categories" />
                <CategoryFields category={category} />
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
                  <SelectField
                    label="Reassign services/projects to"
                    name="replacementCategoryId"
                    defaultValue=""
                    options={[
                      { value: "", label: "Delete without reassignment" },
                      ...categoryOptions
                        .filter((item) => item.id !== category.id)
                        .map((item) => ({ value: String(item.id), label: item.name })),
                    ]}
                  />
                  <div className="flex items-end">
                    <button type="submit" className="admin-button admin-button-primary">
                      Save category
                    </button>
                  </div>
                  <div className="flex items-end">
                    <button
                      formAction={deleteCategoryAction}
                      className="admin-button admin-button-secondary text-[#b42318]"
                    >
                      Delete category
                    </button>
                  </div>
                </div>
              </form>

              <div className="space-y-5 border-t border-black/8 pt-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-black/48">
                    Services
                  </h3>
                  <p className="text-xs text-black/45">
                    Reassign projects through the project editor category field.
                  </p>
                </div>

                {category.services.length ? (
                  <div className="space-y-5">
                    {category.services.map((service) => (
                      <form
                        key={service.id}
                        action={saveServiceAction}
                        className="rounded-[18px] border border-black/8 bg-[#fbfaf7] p-4"
                      >
                        <input type="hidden" name="redirectTo" value="/admin/categories" />
                        <ServiceFields service={service} categoryId={category.id} />
                        <div className="mt-5 flex justify-end gap-3">
                          <button
                            formAction={deleteServiceAction}
                            className="admin-button admin-button-secondary text-[#b42318]"
                          >
                            Delete
                          </button>
                          <button type="submit" className="admin-button admin-button-primary">
                            Save service
                          </button>
                        </div>
                      </form>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No services in this category yet."
                    description="Add the first service below."
                  />
                )}

                <form action={saveServiceAction} className="rounded-[18px] border border-dashed border-black/10 bg-white p-4">
                  <input type="hidden" name="redirectTo" value="/admin/categories" />
                  <ServiceFields categoryId={category.id} />
                  <div className="mt-5 flex justify-end">
                    <button type="submit" className="admin-button admin-button-primary">
                      Add service
                    </button>
                  </div>
                </form>
              </div>
            </article>
          ))
        ) : null}
      </section>
    </div>
  );
}
