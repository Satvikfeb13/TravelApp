import React from 'react'
import { ChipDirective, ChipListComponent, ChipsDirective } from "@syncfusion/ej2-react-buttons";
import { Link, useLocation } from 'react-router'
import { cn, getFirstWord } from '~/lib/utils';

const TripCard = ({ id, name, location, imageUrl, tags, price }: TripCardProps) => {
  const path = useLocation();

  // ✅ FIX: convert string → array → take first image
  const firstImage =
    imageUrl?.split(",")[0]?.trim() || "/placeholder.png";

  return (
    <Link
      to={
        path.pathname === '/' || path.pathname.startsWith("/travel")
          ? `/travel/${id}`
          : `/trips/${id}/`
      }
      className='trip-card'
    >
      {/* ✅ IMAGE */}
      <img src={firstImage} alt={name} />

      {/* ✅ TITLE + LOCATION */}
      <article>
        <h2>{name}</h2>
        <figure>
          <img
            src="/assets/icons/location-mark.svg"
            alt="location"
            className='size-4'
          />
          <figcaption>{location}</figcaption>
        </figure>
      </article>

      {/* ✅ TAGS */}
      <div className="mt-5 pl-[18px] pr-3.5 pb-5">
        <ChipListComponent id="travel-chip">
          <ChipsDirective>
            {tags?.map((tag, index) => (
              <ChipDirective
                key={index}
                text={getFirstWord(tag)} // already fixed earlier
                cssClass={cn(
                  index === 1
                    ? '!bg-pink-50 !text-pink-500'
                    : '!bg-success-50 !text-success-700'
                )}
              />
            ))}
          </ChipsDirective>
        </ChipListComponent>
      </div>

      {/* ✅ PRICE */}
      <article className='tripCard-pill'>{price}</article>
    </Link>
  );
};

export default TripCard;