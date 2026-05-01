import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// List all clients, with optional search by name or phone
app.get("/clients", async (req, res) => {
  const { query } = req.query;
  try {
    const clients = await prisma.client.findMany({
      where: query ? {
        OR: [
          { name: { contains: query as string } },
          { phone: { contains: query as string } },
        ]
      } : undefined,
      include: { vehicles: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

// Create a new client
app.post("/clients", async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone are required" });
  }

  try {
    const client = await prisma.client.create({
      data: { name, phone },
      include: { vehicles: true },
    });
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: "Failed to create client" });
  }
});

// List all vehicles
app.get("/vehicles", async (req, res) => {
  const { query } = req.query;
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: query ? {
        OR: [
          { licensePlate: { contains: query as string } },
          { brand: { contains: query as string } },
          { model: { contains: query as string } },
        ]
      } : undefined,
      include: { owner: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});

// Create a new vehicle
app.post("/vehicles", async (req, res) => {
  const { licensePlate, brand, model, year, mileage, ownerId } = req.body;
  if (!licensePlate || !brand || !model || !year || !mileage || !ownerId) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        licensePlate,
        brand,
        model,
        year: parseInt(year),
        mileage: parseInt(mileage),
        ownerId,
      },
      include: { owner: true }
    });
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: "Failed to create vehicle" });
  }
});

// List all service orders
app.get("/service-orders", async (req, res) => {
  try {
    const orders = await prisma.serviceOrder.findMany({
      include: {
        vehicle: { include: { owner: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch service orders" });
  }
});

// Create a new service order
app.post("/service-orders", async (req, res) => {
  const { vehicleId, currentMileage, hourlyRate, labourHours, observation, items } = req.body;
  if (!vehicleId || currentMileage == null || hourlyRate == null || labourHours == null || !items || !items.length) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let partsPrice = 0;
    const formattedItems = items.map((item: any) => {
      const itemPrice = parseFloat(item.price);
      partsPrice += itemPrice;
      return {
        description: item.description,
        price: itemPrice,
      };
    });

    const totalLabourCost = parseFloat(labourHours) * parseFloat(hourlyRate);
    const totalPrice = partsPrice + totalLabourCost;

    const order = await prisma.$transaction(async (tx) => {
      // Update vehicle mileage
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { mileage: parseInt(currentMileage) },
      });

      // Create Service Order
      return tx.serviceOrder.create({
        data: {
          vehicleId,
          hourlyRate: parseFloat(hourlyRate),
          labourHours: parseFloat(labourHours),
          observation: observation || null,
          totalPrice,
          items: {
            create: formattedItems,
          },
        },
        include: {
          vehicle: { include: { owner: true } },
          items: true,
        },
      });
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create service order" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
