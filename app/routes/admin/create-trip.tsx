import React, { useState } from 'react'
import { Header } from '../../../Components'
import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns'
import type { Route } from "./+types/create-trip"
import { selectItems, comboBoxItems } from '~/constants'
import { cn, formatKey } from '~/lib/utils'
import { LayerDirective, LayersDirective, MapsComponent } from "@syncfusion/ej2-react-maps";
import { world_map } from '~/constants/world_map'
import { ButtonComponent } from '@syncfusion/ej2-react-buttons'
import { account } from '~/appwrite/client'

export const loader = async () => {
    const response = await fetch(
        'https://restcountries.com/v3.1/all?fields=name,latlng,flags,maps'
    );

    const data = await response.json();

    return data.map((country: any) => ({
        name: country.name.common,
        flag: country.flags?.png,
        coordinates: country.latlng || [0, 0],
        value: country.name.common,
        openStreetMap: country.maps?.openStreetMaps,
    }));
};

// ================= COMPONENT =================
const CreateTrip = ({ loaderData }: Route.ComponentProps) => {

    const countries = loaderData as Country[];

    const [formData, setFormData] = useState<TripFormData>({
        country: countries[0]?.name || "",
        duration: 0,
        travelStyle: "",
        interest: "",
        budget: "",
        groupType: ""
    });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // ================= HANDLERS =================
    const handleChange = (key: keyof TripFormData, value: string | number) => {
        setFormData({ ...formData, [key]: value });
    };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        const user = await account.get();

        if (!user?.$id) {
            setError("User not authenticated");
            return;
        }

        const response = await fetch("/api/create-trip", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                country: formData.country,
                numberOfDays: formData.duration,
                travelStyle: formData.travelStyle,
                interests: String(formData.interest),
                budget: formData.budget,
                groupType: formData.groupType,
                userId: user.$id,
            }),
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error);
        }


        window.location.href = `/trips/${result.id}`;

    } catch (e: any) {
        console.error(e);
        setError(e.message);
    } finally {
        setLoading(false);
    }
};
    // ================= DATA =================
    const countryOptions = countries.map((c) => ({
        text: c.name,
        value: c.value,
        flag: c.flag,
    }));

    const mapData = [
        {
            country: formData.country,
            color: '#EA382E',
            coordinates:
                countries.find((c) => c.name === formData.country)?.coordinates || []
        }
    ];

    // ================= UI =================
    return (
        <main className="flex flex-col gap-10 pb-20 wrapper">
            <Header
                title="Add a new Trip"
                description="View and Edit AI Generated Travel plans"
            />

            <section className="mt-2.5 wrapper-md">
                <form className="trip-form" onSubmit={handleSubmit}>

                    {/* COUNTRY */}
                    <div>
                        <label htmlFor="country">Country</label>

                        <ComboBoxComponent
                            id="country"
                            dataSource={countryOptions}
                            fields={{ text: 'text', value: 'value' }}
                            placeholder="Select a country"

                            change={(e: { value: string | undefined }) => {
                                if (e.value) handleChange('country', e.value);
                            }}

                            itemTemplate={(props: any) => (
                                <div className="flex items-center gap-2">
                                    <img src={props.flag} className="w-5 h-5" />
                                    <span>{props.text}</span>
                                </div>
                            )}

                            valueTemplate={(props: any) => (
                                <div className="flex items-center gap-2">
                                    <img src={props.flag} className="w-5 h-5" />
                                    <span>{props.text}</span>
                                </div>
                            )}

                            allowFiltering
                            filtering={(e: any) => {
                                const query = e.text.toLowerCase();

                                e.updateData(
                                    countries
                                        .filter((country) =>
                                            country.name.toLowerCase().includes(query)
                                        )
                                        .map((country) => ({
                                            text: country.name,
                                            value: country.value,
                                            flag: country.flag
                                        }))
                                );
                            }}
                        />
                    </div>

                    {/* DURATION */}
                    <div>
                        <label htmlFor="duration">Duration</label>
                        <input
                            id="duration"
                            type="number"
                            placeholder="Enter number of days (1-10)"
                            className="form-input"
                            onChange={(e) =>
                                handleChange('duration', Number(e.target.value))
                            }
                        />
                    </div>

                    {/* DYNAMIC FIELDS */}
                    {selectItems.map((key) => (
                        <div key={key}>
                            <label htmlFor={key}>{formatKey(key)}</label>

                            <ComboBoxComponent
                                id={key}
                                dataSource={comboBoxItems[key].map((item) => ({
                                    text: item,
                                    value: item,
                                }))}
                                fields={{ text: 'text', value: 'value' }}
                                placeholder={`Select ${formatKey(key)}`}

                                change={(e: { value: string | undefined }) => {
                                    if (e.value) handleChange(key, e.value);
                                }}

                                allowFiltering
                                filtering={(e: any) => {
                                    const query = e.text.toLowerCase();

                                    e.updateData(
                                        comboBoxItems[key]
                                            .filter((item) =>
                                                item.toLowerCase().includes(query)
                                            )
                                            .map((item) => ({
                                                text: item,
                                                value: item,
                                            }))
                                    );
                                }}
                            />
                        </div>
                    ))}

                    {/* MAP */}
                    <div>
                        <label>Location on a world map</label>

                        <MapsComponent zoomSettings={{ enable: true }}>
                            <LayersDirective>
                                <LayerDirective
                                    shapeData={world_map}
                                    dataSource={mapData}
                                    shapePropertyPath="name"
                                    shapeDataPath="country"
                                    shapeSettings={{
                                        colorValuePath: "color",
                                        fill: "#e5e5e5"
                                    }}
                                />
                            </LayersDirective>
                        </MapsComponent>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="error">
                            <p>{error}</p>
                        </div>
                    )}

                    {/* SUBMIT */}
                    <ButtonComponent
                        type="submit"
                        className="button-class !h-12 !w-full"
                        disabled={loading}
                    >
                        <img
                            src={`/assets/icons/${loading ? 'loader.svg' : 'magic-star.svg'}`}
                            className={cn("size-5", { 'animate-spin': loading })}
                        />
                        <span className="text-white">
                            {loading ? 'Generating...' : 'Generate Trip'}
                        </span>
                    </ButtonComponent>

                </form>
            </section>
        </main>
    )
}

export default CreateTrip