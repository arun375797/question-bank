const router = require("express").Router();
const ctrl = require("../controllers/language.controller");
const validate = require("../middlewares/validate");
const {
  createLanguageSchema,
  updateLanguageSchema,
} = require("../validators/schemas");

router.get("/", ctrl.getAll);
router.post("/", validate(createLanguageSchema), ctrl.create);
router.put("/:id", validate(updateLanguageSchema), ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
