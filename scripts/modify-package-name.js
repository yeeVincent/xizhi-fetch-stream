const fs = require('fs');
const path = require('path');

// 读取dist目录中的package.json文件
const packageJsonPath = path.join(__dirname, '../dist', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// 修改name字段
packageJson.name = 'xizhi-fetch-stream';

// 将修改后的内容写回package.json文件
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');

console.log(`package.json name ${packageJson.name} field has been updated.`);
