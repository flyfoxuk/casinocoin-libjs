import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import * as ejs from "ejs";
import { renderFromPaths } from "json-schema-to-markdown-table";

const ROOT = path.dirname(path.normalize(__dirname));

const strip = (value: string): string => {
  return value.replace(/^\s+|\s+$/g, "");
};

const importFile = (relativePath: string): string => {
  const absolutePath = path.join(ROOT, relativePath);
  return strip(fs.readFileSync(absolutePath).toString("utf-8"));
};

const renderFixture = (fixtureRelativePath: string): string => {
  const json = importFile(path.join("test", "fixtures", fixtureRelativePath));
  return "\n```json\n" + json + "\n```\n";
};

const renderSchema = (schemaRelativePath: string): any => {
  const schemasPath = path.join(ROOT, "src", "common", "schemas");
  const schemaPath = path.join(schemasPath, schemaRelativePath);
  return renderFromPaths(schemaPath, schemasPath);
};

const main = () => {
  const locals = {
    importFile,
    renderFixture,
    renderSchema,
  };

  const indexPath: string = path.join(ROOT, "docs", "src", "index.md.ejs");
  ejs.renderFile(indexPath, locals, (error: any, output: any) => {
    if (error) {
      console.error(error);
      process.exit(1);
    } else {
      const outputPath = path.join(ROOT, "docs", "index.md");
      fs.writeFileSync(outputPath, output);
      execSync("npm run doctoc", { cwd: ROOT });
      process.exit(0);
    }
  });
};

main();
