import type { DdfMedia, DdfProperty, DdfRoom } from "../types";

/**
 * DEVELOPMENT-ONLY sample data, shaped exactly like DDF® Web API Property
 * records so the real mapper/filters run against it. Addresses, prices and
 * descriptions are fictional; photos are Unsplash placeholders.
 *
 * Used only when DDF_MODE=mock, or DDF_MODE=auto without credentials.
 */

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?w=1600&q=80&auto=format&fit=crop`;

const EXTERIORS = [
  "1600596542815-ffad4c1539a9",
  "1600585154340-be6161a56a0c",
  "1564013799919-ab600027ffc6",
  "1512917774080-9991f1c4c750",
  "1568605114967-8130f3a36994",
  "1570129477492-45c003edd2be",
  "1580587771525-78b9dba3b914",
  "1613490493576-7fde63acd811",
  "1605276374104-dee2a0ed3cd6",
  "1598228723793-52759bba239c",
  "1576941089067-2de3c901e126",
  "1599809275671-b5942cabc7a2",
  "1523217582562-09d0def993a6",
  "1518780664697-55e3ad937233",
  "1572120360610-d971b9d7767c",
  "1605146769289-440113cc3d00",
];

const CONDO_EXTERIORS = ["1545324418-cc1a3fa10c00", "1460317442991-0ec209397118", "1502672260266-1c1ef2d93688"];

const INTERIORS = [
  "1600607687939-ce8a6c25118c",
  "1600566753190-17f0baa2a6c3",
  "1600210492486-724fe5c67fb0",
  "1554995207-c18c203602cb",
  "1493809842364-78817add7ffb",
  "1484154218962-a197022b5858",
  "1586023492125-27b2c045efd7",
  "1560448204-e02f11c3d0e2",
  "1522708323590-d24dbb6b0267",
  "1583608205776-bfd35f0d9f83",
  "1600047509807-ba8f99d2cdde",
  "1510627489930-0c1b0bfb6785",
  "1507089947368-19c1da9775ae",
  "1600573472550-8090b5e0745e",
  "1616594039964-ae9021a400a0",
  "1556912173-3bb406ef7e77",
  "1600585152220-90363fe7e115",
];

type Seed = {
  number: string;
  street: string;
  suffix: string;
  unit?: string;
  city: string;
  region: string;
  postal: string;
  lat: number;
  lng: number;
  kind: "house" | "condo" | "townhouse" | "multi" | "land";
  price: number;
  lease?: boolean;
  beds: number;
  baths: number;
  sqft: number;
  year: number;
  parking: number;
  daysAgo: number;
  headline: string;
  hideAddress?: boolean;
};

const SEEDS: Seed[] = [
  { number: "48", street: "Kilmory", suffix: "Crescent", city: "Ottawa", region: "Westboro", postal: "K1Z 6J4", lat: 45.3925, lng: -75.7581, kind: "house", price: 1_389_000, beds: 4, baths: 4, sqft: 2850, year: 2019, parking: 3, daysAgo: 1, headline: "Architect-designed modern infill steps from Westboro Village" },
  { number: "1205", street: "Riverside", suffix: "Drive", unit: "1804", city: "Ottawa", region: "Riverview", postal: "K1G 3T8", lat: 45.3957, lng: -75.6594, kind: "condo", price: 569_900, beds: 2, baths: 2, sqft: 1120, year: 2008, parking: 1, daysAgo: 2, headline: "Sun-filled corner suite with sweeping river views" },
  { number: "217", street: "Stonehaven", suffix: "Drive", city: "Kanata", region: "Bridlewood", postal: "K2M 2S8", lat: 45.2921, lng: -75.8763, kind: "house", price: 899_000, beds: 4, baths: 3, sqft: 2410, year: 2004, parking: 4, daysAgo: 3, headline: "Family home backing onto greenspace in Bridlewood" },
  { number: "36", street: "Gardenway", suffix: "Street", city: "Orléans", region: "Avalon", postal: "K4A 0T6", lat: 45.4722, lng: -75.4776, kind: "townhouse", price: 624_500, beds: 3, baths: 3, sqft: 1780, year: 2016, parking: 2, daysAgo: 4, headline: "End-unit townhome with finished lower level" },
  { number: "902", street: "Clearwater", suffix: "Circle", city: "Barrhaven", region: "Half Moon Bay", postal: "K2J 6X3", lat: 45.2608, lng: -75.7389, kind: "house", price: 1_049_000, beds: 5, baths: 4, sqft: 3200, year: 2021, parking: 4, daysAgo: 5, headline: "Nearly new executive home on a premium pie lot" },
  { number: "75", street: "Clarence", suffix: "Street", unit: "610", city: "Ottawa", region: "ByWard Market", postal: "K1N 5P5", lat: 45.4296, lng: -75.6911, kind: "condo", price: 449_000, beds: 1, baths: 1, sqft: 690, year: 2012, parking: 0, daysAgo: 6, headline: "Loft-style living in the heart of the Market" },
  { number: "1420", street: "Carling", suffix: "Avenue", unit: "PH3", city: "Ottawa", region: "Civic Hospital", postal: "K1Z 7L8", lat: 45.3867, lng: -75.7419, kind: "condo", price: 3_200, lease: true, beds: 2, baths: 2, sqft: 1050, year: 2020, parking: 1, daysAgo: 2, headline: "Furnished penthouse for lease with private terrace" },
  { number: "11", street: "Rideau Glen", suffix: "Road", city: "Manotick", region: "Rideau River", postal: "K4M 1A3", lat: 45.2268, lng: -75.6812, kind: "house", price: 2_495_000, beds: 5, baths: 6, sqft: 5200, year: 2015, parking: 6, daysAgo: 9, headline: "Waterfront estate on the Rideau with private dock" },
  { number: "58", street: "Byron", suffix: "Avenue", city: "Ottawa", region: "Hintonburg", postal: "K1Y 3J1", lat: 45.3969, lng: -75.7314, kind: "multi", price: 1_275_000, beds: 6, baths: 3, sqft: 3100, year: 1948, parking: 2, daysAgo: 12, headline: "Updated triplex with strong rental income" },
  { number: "3370", street: "Greenbank", suffix: "Road", city: "Nepean", region: "Barrhaven", postal: "K2J 4H6", lat: 45.2794, lng: -75.7626, kind: "land", price: 385_000, beds: 0, baths: 0, sqft: 0, year: 0, parking: 0, daysAgo: 20, headline: "Rare 0.6-acre building lot in an established pocket" },
  { number: "140", street: "Hunterbrook", suffix: "Place", city: "Stittsville", region: "Fairwinds", postal: "K2S 0W1", lat: 45.2658, lng: -75.9211, kind: "townhouse", price: 579_000, beds: 3, baths: 3, sqft: 1650, year: 2013, parking: 2, daysAgo: 7, headline: "Bright freehold townhome close to parks and schools" },
  { number: "22", street: "Belvedere", suffix: "Crescent", city: "Ottawa", region: "Rockcliffe Park", postal: "K1M 2G6", lat: 45.4461, lng: -75.6694, kind: "house", price: 3_850_000, beds: 6, baths: 7, sqft: 6400, year: 1938, parking: 4, daysAgo: 15, headline: "Landmark Rockcliffe residence, meticulously restored" },
  { number: "650", street: "Dundonald", suffix: "Drive", city: "Kanata", region: "Kanata Lakes", postal: "K2T 0C9", lat: 45.3401, lng: -75.9127, kind: "house", price: 1_165_000, beds: 4, baths: 4, sqft: 3050, year: 2011, parking: 4, daysAgo: 10, headline: "Kanata Lakes family home steps to the golf course" },
  { number: "255", street: "Bay", suffix: "Street", unit: "1107", city: "Ottawa", region: "Centretown", postal: "K1R 0C5", lat: 45.4172, lng: -75.7065, kind: "condo", price: 2_450, lease: true, beds: 1, baths: 1, sqft: 610, year: 2017, parking: 0, daysAgo: 1, headline: "Modern one-bedroom for rent near Parliament Hill" },
  { number: "19", street: "Tulip Tree", suffix: "Way", city: "Orléans", region: "Chapel Hill", postal: "K1E 3K7", lat: 45.4591, lng: -75.5129, kind: "house", price: 729_900, beds: 3, baths: 2, sqft: 1690, year: 1989, parking: 3, daysAgo: 18, headline: "Move-in ready bungalow with a private backyard oasis", hideAddress: true },
  { number: "88", street: "Promenade du Portage", suffix: "", unit: "402", city: "Gatineau", region: "Hull", postal: "J8X 2K1", lat: 45.4274, lng: -75.7134, kind: "condo", price: 389_000, beds: 2, baths: 1, sqft: 880, year: 2014, parking: 1, daysAgo: 8, headline: "Stylish condo minutes from downtown Ottawa" },
  { number: "7", street: "Heron", suffix: "Road", city: "Ottawa", region: "Alta Vista", postal: "K1V 0Y2", lat: 45.3857, lng: -75.6776, kind: "house", price: 949_000, beds: 4, baths: 3, sqft: 2200, year: 1965, parking: 3, daysAgo: 25, headline: "Renovated split-level on a quiet Alta Vista street" },
  { number: "415", street: "Longfields", suffix: "Drive", city: "Barrhaven", region: "Longfields", postal: "K2J 5K7", lat: 45.2733, lng: -75.7458, kind: "townhouse", price: 659_000, beds: 3, baths: 3, sqft: 1840, year: 2009, parking: 2, daysAgo: 30, headline: "Spacious townhome with open-concept main floor" },
  { number: "1560", street: "Scott", suffix: "Street", unit: "905", city: "Ottawa", region: "Westboro", postal: "K1Y 0C4", lat: 45.4011, lng: -75.7355, kind: "condo", price: 739_000, beds: 2, baths: 2, sqft: 1210, year: 2018, parking: 1, daysAgo: 11, headline: "Contemporary two-bed by the LRT and the river" },
  { number: "5", street: "Wilshire", suffix: "Avenue", city: "Nepean", region: "Craig Henry", postal: "K2G 3V8", lat: 45.3312, lng: -75.7512, kind: "multi", price: 985_000, beds: 5, baths: 2, sqft: 2400, year: 1972, parking: 4, daysAgo: 40, headline: "Legal duplex — live in one unit, rent the other" },
  { number: "310", street: "Tweedsmuir", suffix: "Avenue", city: "Ottawa", region: "Westboro", postal: "K1Z 5N4", lat: 45.3946, lng: -75.7602, kind: "house", price: 1_795_000, beds: 5, baths: 5, sqft: 3650, year: 2022, parking: 3, daysAgo: 5, headline: "Brand-new custom build with chef's kitchen" },
  { number: "92", street: "Pinecrest", suffix: "Road", city: "Stittsville", region: "Jackson Trails", postal: "K2S 1B7", lat: 45.2601, lng: -75.9063, kind: "house", price: 815_000, beds: 4, baths: 3, sqft: 2150, year: 2002, parking: 4, daysAgo: 14, headline: "Well-kept two-storey near Trans Canada Trail" },
  { number: "400", street: "Stewart", suffix: "Street", unit: "1502", city: "Ottawa", region: "Sandy Hill", postal: "K1N 6L2", lat: 45.4262, lng: -75.6801, kind: "condo", price: 499_000, beds: 2, baths: 2, sqft: 980, year: 1990, parking: 1, daysAgo: 22, headline: "Spacious condo with all-inclusive fees" },
  { number: "1840", street: "Mer Bleue", suffix: "Road", city: "Orléans", region: "Navan", postal: "K4A 0G9", lat: 45.4398, lng: -75.4803, kind: "land", price: 649_000, beds: 0, baths: 0, sqft: 0, year: 0, parking: 0, daysAgo: 60, headline: "Two-acre treed lot, zoned rural residential" },
];

// Deterministic PRNG so the mock dataset is stable across restarts.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, items: readonly T[], count: number): T[] {
  const pool = [...items];
  const out: T[] = [];
  while (out.length < count && pool.length) out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  return out;
}

// Listing dates are relative to server start so "new listing" filters behave realistically.
const REFERENCE_DATE = Date.now();

function describe(seed: Seed): string {
  if (seed.kind === "land") {
    return `${seed.headline}. Services at the road, level topography and mature trees make this an ideal setting for your custom home. Minutes to shopping, schools and commuter routes in ${seed.region}. Buyer to verify zoning and permitted uses with the City.`;
  }
  const bedsText = `${seed.beds} bedroom${seed.beds === 1 ? "" : "s"}`;
  return `${seed.headline}. This ${bedsText}, ${seed.baths}-bath ${
    seed.kind === "condo" ? "suite" : "home"
  } offers approximately ${seed.sqft.toLocaleString("en-CA")} sq ft of thoughtfully designed living space in sought-after ${seed.region}. The open main living area is filled with natural light, anchored by a kitchen with quartz counters, full-height cabinetry and stainless appliances. The primary suite features a walk-in closet and a spa-inspired ensuite. Close to parks, transit, schools and everyday amenities — book your private showing today.`;
}

function rooms(seed: Seed, rand: () => number): DdfRoom[] {
  if (seed.kind === "land") return [];
  const out: DdfRoom[] = [
    { RoomType: "Living room", RoomLevel: "Main level", RoomDimensions: `${14 + Math.floor(rand() * 6)}' x ${12 + Math.floor(rand() * 4)}'` },
    { RoomType: "Kitchen", RoomLevel: "Main level", RoomDimensions: `${12 + Math.floor(rand() * 5)}' x ${10 + Math.floor(rand() * 4)}'` },
    { RoomType: "Dining room", RoomLevel: "Main level", RoomDimensions: `${11 + Math.floor(rand() * 4)}' x ${10 + Math.floor(rand() * 3)}'` },
    { RoomType: "Primary Bedroom", RoomLevel: seed.kind === "condo" ? "Main level" : "Second level", RoomDimensions: `${14 + Math.floor(rand() * 4)}' x ${12 + Math.floor(rand() * 3)}'` },
  ];
  for (let i = 2; i <= seed.beds && i <= 5; i++) {
    out.push({ RoomType: "Bedroom", RoomLevel: seed.kind === "condo" ? "Main level" : "Second level", RoomDimensions: `${10 + Math.floor(rand() * 3)}' x ${10 + Math.floor(rand() * 2)}'` });
  }
  if (seed.kind !== "condo") out.push({ RoomType: "Recreation room", RoomLevel: "Basement", RoomDimensions: `${18 + Math.floor(rand() * 6)}' x ${14 + Math.floor(rand() * 4)}'` });
  return out;
}

function buildRecord(seed: Seed, index: number): DdfProperty {
  const rand = mulberry32(index + 1);
  const key = String(27_104_310 + index * 137);
  const isCondo = seed.kind === "condo";
  const exterior = isCondo ? CONDO_EXTERIORS[index % CONDO_EXTERIORS.length] : EXTERIORS[index % EXTERIORS.length];
  const photoIds = seed.kind === "land" ? [exterior] : [exterior, ...pick(rand, INTERIORS, 6 + Math.floor(rand() * 4))];
  const media: DdfMedia[] = photoIds.map((id, order) => ({
    MediaKey: `${key}-${order}`,
    MediaURL: unsplash(id),
    Order: order,
    PreferredPhotoYN: order === 0,
    MediaCategory: "Property Photo",
    LongDescription: null,
  }));

  const structure: Record<Seed["kind"], string[]> = {
    house: ["House"],
    condo: ["Apartment"],
    townhouse: ["Row / Townhouse"],
    multi: ["Duplex"],
    land: [],
  };
  const subType: Record<Seed["kind"], string> = {
    house: "Single Family",
    condo: "Single Family",
    townhouse: "Single Family",
    multi: "Multi-family",
    land: "Vacant Land",
  };

  const listed = new Date(REFERENCE_DATE - seed.daysAgo * 86_400_000).toISOString();

  return {
    ListingKey: key,
    ListingId: `X${(1_400_000 + index * 911).toString()}`,
    StandardStatus: "Active",
    PropertySubType: subType[seed.kind],
    StructureType: structure[seed.kind],
    CommonInterest: isCondo ? "Condo/Strata" : "Freehold",
    ListPrice: seed.lease ? null : seed.price,
    LeaseAmount: seed.lease ? seed.price : null,
    LeaseAmountFrequency: seed.lease ? "Monthly" : null,
    AssociationFee: isCondo && !seed.lease ? Math.round(seed.sqft * 0.62) : null,
    AssociationFeeFrequency: isCondo && !seed.lease ? "Monthly" : null,
    TaxAnnualAmount: seed.lease ? null : Math.round(seed.price * 0.0108),
    TaxYear: seed.lease ? null : 2025,
    PublicRemarks: describe(seed),
    Inclusions: seed.kind === "land" ? null : "Fridge, stove, dishwasher, washer, dryer, all window coverings and light fixtures.",
    StreetNumber: seed.number,
    StreetName: seed.street,
    StreetSuffix: seed.suffix || null,
    UnitNumber: seed.unit ?? null,
    UnparsedAddress: `${seed.unit ? `${seed.unit} - ` : ""}${seed.number} ${seed.street}${seed.suffix ? ` ${seed.suffix}` : ""}, ${seed.city}, ${seed.city === "Gatineau" ? "Quebec" : "Ontario"} ${seed.postal}`,
    City: seed.city,
    CityRegion: seed.region,
    StateOrProvince: seed.city === "Gatineau" ? "Quebec" : "Ontario",
    PostalCode: seed.postal,
    Country: "Canada",
    Latitude: seed.lat,
    Longitude: seed.lng,
    BedroomsTotal: seed.kind === "land" ? null : seed.beds,
    BedroomsAboveGrade: seed.kind === "land" ? null : Math.max(1, seed.beds - (seed.beds >= 4 ? 1 : 0)),
    BedroomsBelowGrade: seed.kind === "land" ? null : seed.beds >= 4 ? 1 : 0,
    BathroomsTotalInteger: seed.kind === "land" ? null : seed.baths,
    BathroomsPartial: seed.baths >= 3 ? 1 : 0,
    LivingArea: seed.sqft || null,
    LivingAreaUnits: seed.sqft ? "square feet" : null,
    LotSizeArea: isCondo ? null : seed.kind === "land" ? (seed.price > 500_000 ? 2 : 0.6) : Number((0.1 + rand() * 0.3).toFixed(2)),
    LotSizeUnits: isCondo ? null : "acres",
    LotSizeDimensions: isCondo ? null : `${50 + Math.floor(rand() * 40)} x ${100 + Math.floor(rand() * 60)} FT`,
    ParkingTotal: seed.parking,
    ParkingFeatures: seed.kind === "land" ? [] : isCondo ? (seed.parking ? ["Underground"] : []) : ["Attached Garage", "Inside Entry"],
    YearBuilt: seed.year || null,
    Stories: isCondo || seed.kind === "land" ? null : 2,
    Heating: seed.kind === "land" ? [] : ["Forced air", "Natural gas"],
    Cooling: seed.kind === "land" ? [] : ["Central air conditioning"],
    Basement: isCondo || seed.kind === "land" ? [] : ["Full", "Finished"],
    Flooring: seed.kind === "land" ? [] : ["Hardwood", "Ceramic Tile"],
    Appliances: seed.kind === "land" ? [] : ["Dishwasher", "Dryer", "Refrigerator", "Stove", "Washer", "Microwave Range Hood Combo"],
    FireplaceFeatures: seed.price > 900_000 && !isCondo ? ["Gas", "Mantel"] : [],
    ExteriorFeatures: seed.kind === "land" ? [] : isCondo ? ["Concrete"] : ["Brick", "Siding"],
    BuildingFeatures: isCondo ? ["Exercise Centre", "Party Room", "Concierge", "Storage - Locker"] : [],
    CommunityFeatures: ["Public Transit", "Park", "Schools", "Shopping"],
    WaterfrontFeatures: seed.region === "Rideau River" ? ["Waterfront", "Dock"] : [],
    View: seed.headline.toLowerCase().includes("view") ? ["River view", "City view"] : [],
    LotFeatures: seed.kind === "land" ? ["Treed", "Level"] : [],
    Utilities: ["Natural Gas", "Electricity"],
    WaterSource: seed.kind === "land" || seed.region === "Rideau River" ? ["Well"] : ["Municipal water"],
    Sewer: seed.kind === "land" || seed.region === "Rideau River" ? ["Septic System"] : ["Municipal sewage system"],
    Zoning: seed.kind === "land" ? "RR" : "R1",
    Rooms: rooms(seed, rand),
    Media: media,
    PhotosCount: media.length,
    ListingURL: null,
    ListOfficeKey: "mock-office-1",
    ListAOR: "Ottawa Real Estate Board",
    OriginatingSystemName: "Ottawa Real Estate Board",
    InternetEntireListingDisplayYN: true,
    InternetAddressDisplayYN: !seed.hideAddress,
    OriginalEntryTimestamp: listed,
    ModificationTimestamp: listed,
  };
}

export const MOCK_PROPERTIES: DdfProperty[] = SEEDS.map(buildRecord);
