-- I8: Add foreign key constraint on loyalty_transactions.order_id -> orders.id
-- ON DELETE SET NULL: deleting an order should not delete loyalty transactions,
-- just null out the reference

ALTER TABLE public.loyalty_transactions
ADD CONSTRAINT fk_loyalty_transactions_order
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;
