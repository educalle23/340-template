select inv_model from public.inventory
order by inv_make ASC


select * from public.inventory
order by inv_year DESC


select * from public.inventory
where inv_year < '2000'
order by inv_year DESC


update inventory
set inv_description = replace(inv_description, 'small interiors', 'a huge interior')
where inv_id = '10'; 

select i.inv_make, i.inv_model, c.classification_name
from inventory i
inner join classification c on i.classification_id = c.classification_id
where classification_name = 'Sport';

update inventory
set inv_image = replace(inv_image, '/images', '/images/vehicles'),
inv_thumbnail = replace(inv_thumbnail, '/images', '/images/vehicles');