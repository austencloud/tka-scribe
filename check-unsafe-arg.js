const { ESLint } = require("eslint");

async function checkUnsafeArgument() {
  const eslint = new ESLint({
    overrideConfig: {
      rules: {
        "@typescript-eslint/no-unsafe-argument": "error"
      }
    }
  });

  const results = await eslint.lintFiles(["src/**/*.ts", "src/**/*.svelte"]);
  const warnings = results.flatMap(file => 
    file.messages
      .filter(msg => msg.ruleId === "@typescript-eslint/no-unsafe-argument")
      .map(msg => ({
        file: file.filePath.replace(/^.*[\/]src[\/]/, 'src/'),
        line: msg.line,
        message: msg.message
      }))
  );

  console.log(`\nTotal no-unsafe-argument warnings: ${warnings.length}\n`);
  
  if (warnings.length > 0) {
    warnings.forEach(w => {
      console.log(`${w.file}:${w.line} - ${w.message}`);
    });
  } else {
    console.log("✅ No no-unsafe-argument warnings found!");
  }
}

checkUnsafeArgument().catch(console.error);
