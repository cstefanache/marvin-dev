type JSONValue =
    | string
    | number
    | boolean
    | JSONObject
    | JSONArray;

export interface JSONObject {
    [x: string]: JSONValue;
}

type JSONArray = Array<JSONValue>;

export interface Property {
  contentMediaType: string;
  description: string;
  error: boolean;
  isRequired?: boolean;
  path: string;
  registryKey: string
  size: {xs: number, sm: number};
  title: string;
  type: string;
  uiType: string;
  readOnly: boolean;
  uiIndex?: number;
  properties?: any;
  enum?: any;
}