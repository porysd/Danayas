import { z } from "@hono/zod-openapi";

export const PackageDTO = z.object({
    packageId: z.number().int().openapi({
        description: "The id of the package",
        example: 1,
    }),
    name: z.string().openapi({
        description: "The name of the package",
        example: "Package 1",
    }),
    imageUrl: z.string().openapi({
        description: "The image URL of the package",
        example: "http://example.com/image.jpg",
    }),
    price: z.number().openapi({
        description: "The price of the package",
        example: 1000,
    }),
    description: z.string().openapi({
        description: "The description of the package",
        example: "This is a package description",
    }),
    status: z.enum(["active", "inactive", "coming-soon", "sold-out"]).openapi({
        description: "The status of the package",
        example: "active",
        default: "active",
    }),
    isPromo: z.boolean().openapi({
        description: "Indicates if the package is a promo (true = promo, false = not promo)",
        example: false,
      }),
    promoStart: z.string().nullable().openapi({
        description: "The start date of the promo",
        example: "2025-04-01T00:00:00Z",
    }),
    promoEnd: z.string().nullable().openapi({
        description: "The end date of the promo",
        example: "2025-04-30T00:00:00Z",
    }),
    createdAt: z.string().openapi({
        description: "The date where the package was created",
        example: new Date().toUTCString(),
    }),
    updatedAt: z.string().openapi({
        description: "The date where the package was last updated",
        example: new Date().toUTCString(),
    }),
})
  
export const UpdatePackageDTO = PackageDTO.omit({
    packageId: true,
    createdAt: true,
    updatedAt: true
}).partial();

export const CreatePackageDTO = PackageDTO.omit({
    packageId: true,
    createdAt: true,
    updatedAt: true
});