import fs from "node:fs";
import jwt_decode from "jwt-decode";
import type { INewsItem } from "@interfaces/INews";

const AIRTABLE_BASE_URL = "https://api.airtable.com/v0/";

const airtableToken = import.meta.env.AIRTABLE_TOKEN;
const airtableNewsBaseId = import.meta.env.NEWS_AIRTABLE_BASE_ID;
const airtableInterventionsBaseId = import.meta.env
  .INTERVENTIONS_AIRTABLE_BASE_ID;

const commonHeaders = {
  "content-type": "application/json",
  Authorization: `Bearer ${airtableToken}`,
};

interface IImage {
  id?: string;
  url?: string;
  thumbnails?: {
    small?: { url?: string };
    medium?: { url?: string };
    large?: { url?: string };
  };
}

interface AirtableNewsResponse {
  records: Array<{
    id?: string;
    createdTime?: string;
    fields: {
      Name?: string;
      "Instagram URL"?: string;
      Status?: string;
      "Post date"?: string;
      "Media type"?: Array<string>;
      Images: Array<IImage>;
      "Selected Photos (from Event)"?: Array<IImage>;
      Type?: Array<string>;
    };
  }>;
}

interface AirtablePoiResponse {
  records: Array<AirtablePoiRecord>;
}

interface AirtablePoiRecord {
  id?: string;
  createdTime?: string;
  fields: AirtablePoiFields;
  location?: { lat?: number; lng?: number };
}

interface AirtablePoiFields {
  "Short description"?: string;
  "End Date"?: string;
  "Project or Intervention"?: string;
  "Impact reason"?: string;
  Kind?: string;
  "Start Date"?: string;
  "Geo cash (Event)"?: string;
  "Public Photos"?: Array<IImage>;
}

interface IDecodedJwt {
  i: string;
  o: {
    status: string;
    formattedAddress: string;
    lat: number;
    lng: number;
    blockInstallationIds: [string, string];
    locationFieldId: string;
  };
  e: number;
}

const fetchAndHandleErrors = async <T>(
  resource: RequestInfo,
  options?: RequestInit
): Promise<T> => {
  const response = await fetch(AIRTABLE_BASE_URL + resource, {
    ...options,
    headers: {
      ...options?.headers,
      ...commonHeaders,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Server returned Error: " + text);
    throw new Error("Server returned Error: " + text);
  }

  return response.json();
};

export const getNewsItems = async () => {
  const { records } = await fetchAndHandleErrors<AirtableNewsResponse>(
    airtableNewsBaseId
  );

  console.log("Getting News");

  if (records && records.length > 0) {
    try {
      fs.writeFileSync("./fetch.json", JSON.stringify(records));
    } catch (err) {
      console.error("Error while writing file", err);
    }

    const filtered = records
      // has Instagram URL
      ?.filter((record) => record.fields?.["Instagram URL"])
      // has status "live"
      .filter((record) => record.fields?.["Status"] === "live")
      // is of media type "photo"
      .filter((record) => record.fields?.["Media type"]?.includes("photo"))
      // has images
      .filter(
        (record) =>
          record.fields?.["Images"]?.length ||
          record.fields?.["Selected Photos (from Event)"]?.length
      )
      .sort((a, b) => {
        const dateA = new Date(a?.fields?.["Post date"] || 0).getTime();
        const dateB = new Date(b?.fields?.["Post date"] || 0).getTime();
        return dateB - dateA;
      })
      .map((record) => {
        return {
          title: record.fields.Name,
          target: record.fields?.["Instagram URL"],
          instagram: true,
          image:
            record.fields?.["Images"]?.[0].thumbnails?.["large"]?.url ||
            record.fields?.["Selected Photos (from Event)"]?.[0].thumbnails?.[
              "large"
            ]?.url,
        } as INewsItem;
      });
    return filtered;
  }
};

export const getMapPois = async () => {
  const { records } = await fetchAndHandleErrors<AirtablePoiResponse>(
    airtableInterventionsBaseId
  );
  // console.log("FETCHING POIS");

  if (records && records.length > 0) {
    try {
      fs.writeFileSync("./fetchPois.json", JSON.stringify(records));
    } catch (err) {
      console.error("Error while writing file", err);
    }

    const withLocation = records.map((record) => {
      // Cut off unnecessary Emoji at the front of the string
      const locationJwt = record?.fields?.["Geo cash (Event)"]?.slice(3);

      let locationDecoded;

      if (locationJwt) {
        // console.log("JWT", locationJwt);
        try {
          locationDecoded = jwt_decode<IDecodedJwt>(locationJwt, {
            header: true,
          });
        } catch (e) {
          console.log(e);
          console.log("Malformed:", record?.fields?.["Geo cash (Event)"]);
        }
        // console.log("Decoded", locationDecoded);

        if (locationDecoded?.o?.lat && locationDecoded?.o?.lng) {
          return {
            ...record,
            location: {
              lat: locationDecoded?.o?.lat,
              lng: locationDecoded?.o?.lng,
            },
          };
        }
      }

      return record;
    });

    const filtered = withLocation
      ?.filter((poi) => poi.location)
      ?.filter((poi) => poi.fields["Public Photos"]?.length)
      .map((poi) => ({
        locationLngLat: poi.location,
        title: poi.fields["Short description"],
        date: "July 17th - 27th, 2023",
        image: poi.fields["Public Photos"]?.[0].thumbnails?.large?.url,
        airtable: true,
      }));

      try {
        fs.writeFileSync("./filteredPois.json", JSON.stringify(filtered));
      } catch (err) {
        console.error("Error while writing file", err);
      }

    return filtered;
  }
};
