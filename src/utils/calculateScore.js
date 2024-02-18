const {
  TITLE_WEIGHT,
  DESCRIPTION_WEIGHT,
  TRANSCRIPT_WEIGHT,
  TAG_WEIGHT,
  K1,
  B,
} = require("../constants/rankingConstants");

function calculateBM25(IDF, TF, documentLength, averageDocumentLength) {
  return (
    (IDF * (TF * (K1 + 1))) /
    (TF + K1 * (1 - B + (B * documentLength) / averageDocumentLength))
  );
}

exports.calculateAverage = function (prevAverage, totalCount, documentLength) {
  return Math.floor(
    (prevAverage * (totalCount - 1) + documentLength) / totalCount,
  );
};

exports.calculateIDF = function (totalDocuments, documents) {
  return Math.log(
    (totalDocuments - documents.length + 0.5) / (documents.length + 0.5) + 1,
  );
};

exports.calculateTF = function (document, keyword) {
  return document.filter((word) => keyword === word).length;
};

exports.calculateBM25F = function (
  IDF,
  TFs,
  fieldTokens,
  averageDocumentLength,
) {
  const score =
    TITLE_WEIGHT *
      calculateBM25(
        IDF,
        TFs.titleTF,
        fieldTokens.titleTokens.length,
        averageDocumentLength.titleLength,
      ) +
    DESCRIPTION_WEIGHT *
      calculateBM25(
        IDF,
        TFs.descriptionTF,
        fieldTokens.descriptionTokens.length,
        averageDocumentLength.descriptionLength,
      ) +
    TRANSCRIPT_WEIGHT *
      (calculateBM25(
        IDF,
        TFs.transcriptTF,
        fieldTokens.transcriptTokens.length,
        averageDocumentLength.transcriptLength,
      ) || 0) +
    TAG_WEIGHT *
      (calculateBM25(
        IDF,
        TFs.tagTF,
        fieldTokens.tagTokens.length,
        averageDocumentLength.tagLength,
      ) || 0);

  return score;
};
