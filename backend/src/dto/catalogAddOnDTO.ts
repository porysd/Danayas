import { z } from "@hono/zod-openapi";

export const CatalogAddOnDTO = z.object({
  catalogAddOnId: z.number().int().openapi({
    description: "The ID of the catalog add-on",
    example: 1,
  }),
  itemName: z.string().openapi({
    description: "Name of the add on",
    example: "Extra Chairs",
  }),
  price: z.number().openapi({
    description: "Price of the add on",
    example: 500,
  }),
  status: z.enum(["active", "inactive"]).openapi({
    description: "Status of the discount",
    example: "active",
  }),
  createdAt: z.string().openapi({
    description: "The date when the booking was created",
    example: new Date().toISOString(),
  }),
});

export const CreateCatalogAddOnDTO = CatalogAddOnDTO.omit({
  catalogAddOnId: true,
  createdAt: true,
});

export const UpdateCatalogAddOnDTO = CatalogAddOnDTO.omit({
  catalogAddOnId: true,
  createdAt: true,
}).partial();
