module.exports = {
  TOPIC_PREFIX: "wfm",
  WORKORDER_ENTITY_NAME: "workorders",
  SYNC_TOPIC_PREFIX: "wfm:sync",
  ERROR_PREFIX: "error",
  DONE_PREFIX: "done",
  TOPIC_TIMEOUT: 1000,
  TOPICS: {
    CREATE: "create",
    UPDATE: "update",
    LIST: "list",
    REMOVE: "remove",
    READ: "read",
    START: "start",
    STOP: "stop",
    FORCE_SYNC: "force_sync",
    SYNC_COMPLETE: "sync_complete"
  }
};