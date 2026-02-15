const router = require("express").Router();
const ruleCtrl = require("../controllers/rule.controller");
const todoCtrl = require("../controllers/todo.controller");
const revisionCtrl = require("../controllers/revision.controller");
const validate = require("../middlewares/validate");
const {
  createRuleSchema,
  updateRuleSchema,
  reorderRulesSchema,
  createTodoSchema,
  updateTodoSchema,
  createRevisionSchema,
  updateRevisionSchema,
  markRevisedSchema,
  snoozeRevisionSchema,
} = require("../validators/schemas");

// Rules
router.get("/rules", ruleCtrl.getAll);
router.post("/rules", validate(createRuleSchema), ruleCtrl.create);
router.put("/rules/reorder", validate(reorderRulesSchema), ruleCtrl.reorder);
router.put("/rules/:id", validate(updateRuleSchema), ruleCtrl.update);
router.delete("/rules/:id", ruleCtrl.remove);

// Todos
router.get("/todos", todoCtrl.getAll);
router.post("/todos", validate(createTodoSchema), todoCtrl.create);
router.put("/todos/:id", validate(updateTodoSchema), todoCtrl.update);
router.delete("/todos/:id", todoCtrl.remove);

// Revision items (spaced repetition)
router.get("/revisions", revisionCtrl.getAll);
router.post("/revisions", validate(createRevisionSchema), revisionCtrl.create);
router.put("/revisions/:id", validate(updateRevisionSchema), revisionCtrl.update);
router.delete("/revisions/:id", revisionCtrl.remove);
router.post("/revisions/:id/mark-revised", validate(markRevisedSchema), revisionCtrl.markRevised);
router.post("/revisions/:id/snooze", validate(snoozeRevisionSchema), revisionCtrl.snooze);

module.exports = router;
