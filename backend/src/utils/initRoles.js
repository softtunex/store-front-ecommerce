// src/utils/initRoles.js
import Role from "../models/schemas/roleModel.js";

export const initializeRoles = async () => {
  try {
    // Check if roles already exist
    const count = await Role.countDocuments();

    if (count === 0) {
      // Create default roles
      await Role.create([
        {
          name: "customer",
          permissions: ["view_products", "place_orders", "view_own_orders"],
          description: "Regular customer role",
        },
        {
          name: "shop-owner",
          permissions: [
            "view_products",
            "place_orders",
            "view_own_orders",
            "manage_own_store",
            "manage_own_products",
          ],
          description: "Store owner role",
        },
        {
          name: "admin",
          permissions: [
            "view_products",
            "place_orders",
            "view_all_orders",
            "manage_all_stores",
            "manage_all_products",
            "manage_users",
            "manage_roles",
          ],
          description: "Administrator role",
        },
      ]);

      console.log("Default roles created successfully");
    }
  } catch (error) {
    console.error("Error initializing roles:", error);
  }
};
