const router = require("express").Router();
const ctrl = require("../controllers/subtopic.controller");
const validate = require("../middlewares/validate");
const {
  createSubtopicSchema,
  updateSubtopicSchema,
} = require("../validators/schemas");

router.get("/", ctrl.getAll);
router.post("/", validate(createSubtopicSchema), ctrl.create);
router.put("/:id", validate(updateSubtopicSchema), ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
