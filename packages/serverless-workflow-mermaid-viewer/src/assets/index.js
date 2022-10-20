const nodePath = require("path");
const nodeFs = require("fs");

module.exports = {
  swEditorPath: () => {
    const path = nodePath.resolve(__dirname, "dist");

    if (!nodeFs.existsSync(path)) {
      throw new Error(`Serverless Workflow Editor :: Serverless Editor path doesn't exist: ${path}`);
    }

    console.info(`Serverless Workflow Editor :: Serverless Editor path: ${path}`);

    return path;
  },
};
