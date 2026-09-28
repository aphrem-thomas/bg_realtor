/**
 * Types for the REALTOR.ca DDF® Web API (RESO Data Dictionary based).
 * Source: https://ddfapi-docs.realtor.ca/ — only the fields this site uses are
 * typed; the API returns many more.
 */

export type DdfMedia = {
  MediaKey?: string | null;
  MediaURL?: string | null;
  LongDescription?: string | null;
  Order?: number | null;
  PreferredPhotoYN?: boolean | null;
  MediaCategory?: string | null;
  ModificationTimestamp?: string | null;
};

export type DdfRoom = {
  RoomKey?: string | null;
  RoomType?: string | null;
  RoomLevel?: string | null;
  RoomDimensions?: string | null;
  RoomLength?: number | null;
  RoomWidth?: number | null;
  RoomLengthWidthUnits?: string | null;
  RoomDescription?: string | null;
};

export type DdfProperty = {
  ListingKey: string;
  ListingId?: string | null;
  StandardStatus?: string | null;
  PropertySubType?: string | null;
  StructureType?: string[] | null;
  CommonInterest?: string | null;
  ArchitecturalStyle?: string[] | null;

  ListPrice?: number | null;
  LeaseAmount?: number | null;
  LeaseAmountFrequency?: string | null;
  TotalActualRent?: number | null;
  AssociationFee?: number | null;
  AssociationFeeFrequency?: string | null;
  AssociationFeeIncludes?: string[] | null;
  TaxAnnualAmount?: number | null;
  TaxYear?: number | null;

  PublicRemarks?: string | null;
  Inclusions?: string | null;

  UnparsedAddress?: string | null;
  StreetNumber?: string | null;
  StreetDirPrefix?: string | null;
  StreetName?: string | null;
  StreetSuffix?: string | null;
  StreetDirSuffix?: string | null;
  UnitNumber?: string | null;
  City?: string | null;
  CityRegion?: string | null;
  SubdivisionName?: string | null;
  StateOrProvince?: string | null;
  PostalCode?: string | null;
  Country?: string | null;
  Latitude?: number | null;
  Longitude?: number | null;

  BedroomsTotal?: number | null;
  BedroomsAboveGrade?: number | null;
  BedroomsBelowGrade?: number | null;
  BathroomsTotalInteger?: number | null;
  BathroomsPartial?: number | null;
  LivingArea?: number | null;
  LivingAreaUnits?: string | null;
  BuildingAreaTotal?: number | null;
  BuildingAreaUnits?: string | null;
  LotSizeArea?: number | null;
  LotSizeUnits?: string | null;
  LotSizeDimensions?: string | null;
  ParkingTotal?: number | null;
  ParkingFeatures?: string[] | null;
  YearBuilt?: number | null;
  Stories?: number | null;

  Heating?: string[] | null;
  Cooling?: string[] | null;
  Basement?: string[] | null;
  Flooring?: string[] | null;
  Appliances?: string[] | null;
  FireplaceFeatures?: string[] | null;
  FireplacesTotal?: number | null;
  ExteriorFeatures?: string[] | null;
  ConstructionMaterials?: string[] | null;
  Roof?: string[] | null;
  FoundationDetails?: string[] | null;
  BuildingFeatures?: string[] | null;
  CommunityFeatures?: string[] | null;
  PoolFeatures?: string[] | null;
  WaterfrontFeatures?: string[] | null;
  View?: string[] | null;
  LotFeatures?: string[] | null;
  Utilities?: string[] | null;
  WaterSource?: string[] | null;
  Sewer?: string[] | null;
  AccessibilityFeatures?: string[] | null;
  SecurityFeatures?: string[] | null;
  Fencing?: string[] | null;
  Zoning?: string | null;

  Rooms?: DdfRoom[] | null;
  Media?: DdfMedia[] | null;
  PhotosCount?: number | null;

  ListingURL?: string | null;
  ListOfficeKey?: string | null;
  ListAgentKey?: string | null;
  ListAOR?: string | null;
  OriginatingSystemName?: string | null;

  InternetEntireListingDisplayYN?: boolean | null;
  InternetAddressDisplayYN?: boolean | null;

  OriginalEntryTimestamp?: string | null;
  ModificationTimestamp?: string | null;
  StatusChangeTimestamp?: string | null;
};

export type DdfOffice = {
  OfficeKey: string;
  OfficeName?: string | null;
  OfficePhone?: string | null;
  OfficeCity?: string | null;
};

export type ODataCollection<T> = {
  "@odata.context"?: string;
  "@odata.count"?: number;
  "@odata.nextLink"?: string;
  value: T[];
};

// ---------------------------------------------------------------------------
// Domain model — what the UI consumes. Decoupled from DDF field names so the
// data source can change without touching components.
// ---------------------------------------------------------------------------

export type ListingPhoto = { url: string; caption: string | null };

export type ListingFeatureGroup = { label: string; items: string[] };

export type ListingRoom = {
  type: string;
  level: string | null;
  dimensions: string | null;
};

export type ListingSummary = {
  key: string;
  slug: string;
  mlsNumber: string | null;
  transaction: "sale" | "lease";
  price: number | null;
  priceLabel: string;
  leaseFrequency: string | null;
  addressVisible: boolean;
  /** Street line (or a generic description when the address is withheld). */
  streetAddress: string;
  city: string | null;
  province: string | null;
  neighbourhood: string | null;
  propertyType: string;
  beds: number | null;
  baths: number | null;
  livingArea: { value: number; units: string } | null;
  photo: ListingPhoto | null;
  photoCount: number;
  listedAt: string | null;
  status: string | null;
};

export type Listing = ListingSummary & {
  postalCode: string | null;
  fullAddress: string;
  location: { lat: number; lng: number } | null;
  ownership: string | null;
  structureTypes: string[];
  subType: string | null;
  bedsAboveGrade: number | null;
  bedsBelowGrade: number | null;
  bathsPartial: number | null;
  lotSize: { area: number | null; units: string | null; dimensions: string | null } | null;
  parkingTotal: number | null;
  parkingFeatures: string[];
  yearBuilt: number | null;
  stories: number | null;
  description: string | null;
  inclusions: string | null;
  featureGroups: ListingFeatureGroup[];
  rooms: ListingRoom[];
  taxes: { amount: number; year: number | null } | null;
  maintenanceFee: { amount: number; frequency: string | null } | null;
  photos: ListingPhoto[];
  realtorCaUrl: string | null;
  listOfficeKey: string | null;
  board: string | null;
  updatedAt: string | null;
};

export type ListingSearchResult = {
  listings: ListingSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
