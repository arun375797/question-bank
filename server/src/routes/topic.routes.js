const router = require("express").Router();
const ctrl = require("../controllers/topic.controller");
const validate = require("../middlewares/validate");
const {
  createTopicSchema,
  updateTopicSchema,
} = require("../validators/schemas");

router.get("/", ctrl.getAll);
router.post("/", validate(createTopicSchema), ctrl.create);
router.put("/:id", validate(updateTopicSchema), ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
