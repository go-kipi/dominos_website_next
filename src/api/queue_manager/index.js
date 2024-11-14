import { generateUniqueId } from "utils/functions";

const QueueManager = (() => {
  let queue = [];

  function addRequestToQueue(requestData, methodName) {
    const uuid = generateUniqueId(16);

    const data = {
      requestData,
      uuid,
      methodName,
    };
    queue.push(data);
  }

  function removeRequestFromQueue(uuid) {
    queue = queue.filter((e) => e.uuid !== uuid);
  }

  function getNextRequest() {
    if (queue && queue.length > 0) {
      return queue[0];
    }

    return { requestData: null, uuid: null, methodName: null };
  }

  return {
    addRequestToQueue,
    removeRequestFromQueue,
    getNextRequest,
    queue,
  };
})();

export default QueueManager;
