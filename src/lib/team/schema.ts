import { z } from "zod";

export const statPointsSchema = z.object({
  hp: z.number().min(0).max(32),
  atk: z.number().min(0).max(32),
  def: z.number().min(0).max(32),
  spa: z.number().min(0).max(32),
  spd: z.number().min(0).max(32),
  spe: z.number().min(0).max(32),
});

export const slotSchema = z.object({
  species: z.string().nullable(),
  ability: z.string(),
  item: z.string(),
  tera: z.string(),
  moves: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  nature: z.string(),
  statPoints: statPointsSchema,
});

export const teamContentSchema = z.array(slotSchema).length(6);

export type StatPoints = z.infer<typeof statPointsSchema>;
export type TeamSlot = z.infer<typeof slotSchema>;
export type TeamContent = z.infer<typeof teamContentSchema>;
