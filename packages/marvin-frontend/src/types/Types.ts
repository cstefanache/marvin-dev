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
  className: string;
  isRequired?: boolean;
  path: string;
  registryKey: string
  size: {xs: number, sm: number};
  title: string;
  type: string;
  uiType: string;
  default?: any;
  readOnly: boolean;
  uiIndex?: number;
  properties?: any;
  enum?: any;
  inputType?: string;
  iteratorRoot?: boolean;
  collapsed?: boolean;
}