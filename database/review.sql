-- Create reviews table
CREATE TABLE public.reviews (
  review_id SERIAL PRIMARY KEY,
  inv_id INT NOT NULL,
  account_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inv_id) REFERENCES public.inventory(inv_id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES public.account(account_id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX idx_reviews_inv_id ON public.reviews(inv_id);
CREATE INDEX idx_reviews_account_id ON public.reviews(account_id);

-- Add some sample data 

INSERT INTO public.reviews (inv_id, account_id, rating, review_text) 
VALUES 
  (1, 1, 5, 'Excellent vehicle! Very reliable and comfortable.'),
  (1, 2, 4, 'Great car, just a bit pricey for what it offers.');