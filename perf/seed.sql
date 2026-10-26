\set ON_ERROR_STOP on

BEGIN;

INSERT INTO "Flats" (
    "Address",
    "City",
    "Description",
    "RentPrice",
    "Rooms",
    "Bathrooms",
    "OwnerId",
    "CreatedAt",
    "IsAvailable"
)
SELECT
    'Performance Property ' || g.n,
    CASE g.n % 3
        WHEN 0 THEN 'Nairobi'
        WHEN 1 THEN 'Mombasa'
        ELSE 'Kisumu'
    END,
    repeat(
        'Spacious rental with natural light, nearby transport, and secure access. ',
        12
    ),
    10000 + (g.n % 90000),
    1 + (g.n % 5),
    1 + (g.n % 3),
    owner."Id",
    now() - g.n * interval '1 minute',
    g.n % 5 <> 0
FROM generate_series(
    1,
    (
        SELECT greatest(0, 10000 - count(*)::integer)
        FROM "Flats"
    )
) AS g(n)
CROSS JOIN (
    SELECT "Id"
    FROM "AspNetUsers"
    WHERE "Email" = 'owner@flatrent.com'
) AS owner;

INSERT INTO "FlatImages" ("FlatId", "Url")
SELECT
    f."Id",
    '/uploads/perf-' || f."Id" || '-' || image.n || '.jpg'
FROM "Flats" AS f
CROSS JOIN generate_series(1, 3) AS image(n)
WHERE f."Address" LIKE 'Performance Property %'
  AND NOT EXISTS (
      SELECT 1
      FROM "FlatImages" AS existing
      WHERE existing."FlatId" = f."Id"
  );

COMMIT;

ANALYZE "Flats";
ANALYZE "FlatImages";
ANALYZE "AspNetUsers";

SELECT count(*) AS property_count FROM "Flats";
SELECT count(*) AS image_count FROM "FlatImages";