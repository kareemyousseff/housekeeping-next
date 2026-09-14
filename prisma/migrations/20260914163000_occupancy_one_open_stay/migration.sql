-- At most one open stay (endedAt IS NULL) per family member.
CREATE UNIQUE INDEX "OccupancyEvent_one_open_stay_per_member"
ON "OccupancyEvent" ("memberId")
WHERE "endedAt" IS NULL;
