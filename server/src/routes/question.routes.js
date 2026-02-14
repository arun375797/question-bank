const router = require("express").Router();
const ctrl = require("../controllers/question.controller");
const validate = require("../middlewares/validate");
const {
  createQuestionSchema,
  updateQuestionSchema,
  bulkOperationSchema,
} = require("../validators/schemas");

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/bulk", validate(bulkOperationSchema), ctrl.bulk);
router.post("/", validate(createQuestionSchema), ctrl.create);
router.put("/:id", validate(updateQuestionSchema), ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
