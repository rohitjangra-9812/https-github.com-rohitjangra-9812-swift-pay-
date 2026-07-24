const fs = require('fs');
let blueprint = JSON.parse(fs.readFileSync('firebase-blueprint.json', 'utf-8'));
if (!blueprint.entities.UserBackup.properties.balance) {
  blueprint.entities.UserBackup.properties.balance = { type: 'number' };
  fs.writeFileSync('firebase-blueprint.json', JSON.stringify(blueprint, null, 2));
  console.log('Blueprint patched');
}
