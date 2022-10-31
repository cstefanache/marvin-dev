import fs from "fs";
import DefinitionGenerator from "./definitions";

const methodPrefix: any = {
  get: "get",
  post: "create",
  delete: "delete",
  put: "update",
  patch: "update",
};

export default class ApiGenerator {
  constructor(private defGen: DefinitionGenerator) {}

  private getPathName(path: string) {
    const pathParts = path.split("/");

    let name = "";

    pathParts.forEach((pathPart) => {
      if (pathPart.startsWith("{")) {
        const subPath = pathPart.substring(1, pathPart.length - 1);
        name += "By" + subPath.charAt(0).toUpperCase() + subPath.slice(1);
      } else {
        name += pathPart.charAt(0).toUpperCase() + pathPart.slice(1);
      }
    });

    return name;
  }

  public parsePaths(paths: any) {
    console.log("Generating API files...");
    console.log("");

    const apis: any = {};

    Object.keys(paths).forEach((path) => {
      const pathObject = paths[path];
      const name = this.getPathName(path);

      let apiName = path.split("/")[1].replace(/\{|\}|/g, "");
      if (apiName.includes("-")) {
        let suffix = apiName
          .split("-")[1]
          .replace(
            apiName.split("-")[1][0],
            apiName.split("-")[1][0].toUpperCase()
          );
        apiName = apiName.split("-")[0] + suffix;
        apiName = apiName.replace(/-/g, "");
      }
      apiName = apiName.charAt(0).toUpperCase() + apiName.slice(1);
      let collection = apis[apiName];
      let apiCollection: any[] = [];
      let importsList: any[] = [];

      if (!collection) {
        apis[apiName] = {
          imports: importsList,
          collection: apiCollection,
        };
      } else {
        importsList = collection.imports;
        apiCollection = collection.collection;
      }

      Object.keys(pathObject).forEach((method) => {
        const lines = [""];
        const { summary, description, operationId, parameters, responses } =
          pathObject[method];
        const { 201: successResponse } = responses;
        let responseType = "any";
        if (successResponse && successResponse.schema) {
          responseType = this.defGen.getType(
            "",
            successResponse.schema,
            importsList
          );
        }

        let methodName = (methodPrefix[method] + name).replace(/-/g, "");

        const pathParameters: any = [];
        const queryParams: any = [];
        const formData: any = [];
        const headers: any = [];
        let bodyParam = undefined;

        if (parameters) {
          parameters.forEach((param: any) => {
            const {
              name,
              in: paramIn,
              required,
              description,
              type,
              schema,
            } = param;
            pathParameters.push(
              `${name}: ${this.defGen.getType(
                name,
                schema ? schema : param,
                importsList
              )}`
            );

            if (paramIn === "query") {
              //    queryParams.push(`${name}=$\{${name}\})`)
              queryParams.push(name);
            } else if (paramIn === "body") {
              bodyParam = name;
            } else if (paramIn === "formData") {
              formData.push(name);
            }
          });
        }

        let query = "";
        // if (queryParams.length > 0) {
        //    query = `?${queryParams.join('&')}`

        // }

        lines.push(
          `    public async ${methodName}(${pathParameters.join(
            ", "
          )}): Promise<{data: ${responseType} | undefined | null}> {`
        );
        let pathName = path.replace(/\{/g, "${");

        if (formData && formData.length > 0) {
          headers.push(`'content-Type': 'application/x-www-form-urlencoded'`);
          lines.push(`        const formData = new URLSearchParams();`);
          formData.forEach((param: any) => {
            lines.push(
              `        formData.append('${param}', ${param}.toString());`
            );
          });
        }

        let pathNames = pathName.split("/");
        const searchPathParams = pathParameters.map(
          (path: any) => path.split(":")[0]
        );
        for (let i = 1; i <= pathNames.length - 1; i++) {
          const pathNameReplace = pathNames[i].replace(/\${|\}|/g, "");
          if (
            pathNameReplace !== pathNames[i] &&
            !searchPathParams.includes(pathNameReplace)
          ) {
            pathNames[i] = pathNameReplace;
          }
        }

        pathName = pathNames.join("/");

        lines.push(`        return await axios(\`${pathName}${query}\`, {`);
        lines.push(`             method: '${method}',`);
        if (queryParams.length > 0) {
          lines.push(`             params: { ${queryParams.join(", ")} },`);
        }
        if (headers) {
          lines.push(`             headers: { ${headers.join(", ")} },`);
        }
        if (bodyParam) {
          lines.push(`             data: ${bodyParam},`);
        }
        if (formData && formData.length) {
          lines.push(`             data: formData,`);
        }
        lines.push("        })");

        lines.push("    }");

        apiCollection.push(lines);
      });
    });

    Object.keys(apis).forEach((api) => {
      let klassContent = ["", `export default class ${api} {`];
      const { imports, collection } = apis[api];
      collection.forEach((api: any) => {
        klassContent = klassContent.concat(api);
      });

      klassContent.splice(0, 0, "import axios from 'axios';");

      imports.forEach((fileImport: string) => {
        klassContent.splice(
          0,
          0,
          `import ${fileImport} from '../models/${fileImport}'`
        );
      });

      klassContent.push("}");
      fs.writeFileSync(`generated/apis/${api}.ts`, klassContent.join("\n"));
    });
  }
}
