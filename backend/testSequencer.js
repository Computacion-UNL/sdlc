const Sequencer = require('@jest/test-sequencer').default;
class CustomSequencer extends Sequencer {
  sort(tests) {

    let arrayTests = Array.from(tests);
    let orderTests = [];

    arrayTests.forEach(element => {
      let test_path = (process.platform === 'win32') ? element.path.split('__test__\\') : element.path.split('__test__/');
      let test_name = test_path[1].split('.');

      switch (test_name[0]) {
        case "auth":
          orderTests[0] = element;
          break;
        case "role":
          orderTests[1] = element;
          break;
        case "project":
          orderTests[2] = element;
          break;
        case "collaborator":
          orderTests[3] = element;
          break;
        case "iteration":
          orderTests[4] = element;
          break;
        case "activity":
          orderTests[5] = element;
          break;
        case "commentary":
          orderTests[6] = element;
          break;
        case "attachment":
          orderTests[7] = element;
          break;
        case "report":
          orderTests[8] = element;
          break;
        default:
          break;
      }
    });

    return orderTests;
  }
}

module.exports = CustomSequencer;
