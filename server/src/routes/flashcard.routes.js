const router = require("express").Router();
const flashcardCtrl = require("../controllers/flashcard.controller");
const validate = require("../middlewares/validate");
const {
  createFlashcardSchema,
  updateFlashcardSchema,
} = require("../validators/schemas");

router.get("/", flashcardCtrl.getAll);
router.post("/", validate(createFlashcardSchema), flashcardCtrl.create);
router.put("/:id", validate(updateFlashcardSchema), flashcardCtrl.update);
router.delete("/:id", flashcardCtrl.remove);

module.exports = router;
