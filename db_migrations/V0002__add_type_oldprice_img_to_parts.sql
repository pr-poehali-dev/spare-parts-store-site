ALTER TABLE t_p18065113_spare_parts_store_si.parts
ADD COLUMN IF NOT EXISTS type character varying(100) NULL,
ADD COLUMN IF NOT EXISTS old_price numeric(10,2) NULL,
ADD COLUMN IF NOT EXISTS img_url character varying(500) NULL;