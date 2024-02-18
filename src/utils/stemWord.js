const { SUFFIXES } = require("../constants/wordData");

const consonant = "[^aeiou]";
const vowel = "[aeiouy]";
const consonants = `${consonant}[^aeiouy]*`;
const vowels = `${vowel}[aeiou]*`;
const regexMGreater0 = new RegExp(`^(${consonants})?${vowels}${consonants}`);
const regexMEqual1 = new RegExp(
  `^(${consonants})?${vowels}${consonants}(${vowels})?$`,
);
const regexMGreater1 = new RegExp(
  `^(${consonants})?${vowels}${consonants}${vowels}${consonants}`,
);
const regexStemVowel = new RegExp(`^(${consonants})?${vowel}`);
const regexEndsWithDoubleConsonant = /([^aeiouylsz])\1$/;
const regexStemEndCVC = new RegExp(`^${consonants}${vowel}[^aeiouwxy]$`);
const regexEndsWithES = /^(.+?)(ss|i)es$/;
const regexEndsWithS = /^(.+?)([^s])s$/;
const regexEndsWithEED = /^(.+?)eed$/;
const regexEndsWithEDorING = /^(.+?)(ed|ing)$/;
const regexIncludeVowelEndsWithY = /^(.*[aeiouy].*)y$/;
const regexPorterStepTwo =
  /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
const regexPorterStepThree = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
const regexPorterStepFour =
  /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
const regexEndsWithSionOrTion = /^(.+?)(s|t)(ion)$/;
const regexPorterFive = /^(.+?)e$/;

function stemWord(word) {
  const firstCharacter = word.slice(0, 1);

  if (word.length < 3) {
    return word;
  }

  if (firstCharacter === "y") {
    word = firstCharacter.toUpperCase() + word.slice(1);
  }

  if (regexEndsWithES.test(word)) {
    word = word.replace(regexEndsWithES, "$1$2");
  } else if (regexEndsWithS.test(word)) {
    word = word.replace(regexEndsWithS, "$1$2");
  }

  if (regexEndsWithEED.test(word)) {
    const stem = regexEndsWithEED.exec(word)[1];

    if (regexMGreater0.test(stem)) {
      word = word.replace(/.$/, "");
    }
  } else if (regexEndsWithEDorING.test(word)) {
    const stem = regexEndsWithEDorING.exec(word)[1];

    if (regexStemVowel.test(stem)) {
      word = stem;

      if (/(at|bl|iz)$/.test(word)) {
        word += "e";
      } else if (regexEndsWithDoubleConsonant.test(word)) {
        word = word.replace(/.$/, "");
      } else if (regexStemEndCVC.test(word)) {
        word += "e";
      }
    }
  }

  if (regexIncludeVowelEndsWithY.test(word)) {
    const stem = regexIncludeVowelEndsWithY.exec(word)[1];

    word = `${stem}i`;
  }

  if (regexPorterStepTwo.test(word)) {
    const stem = regexPorterStepTwo.exec(word)[1];
    const suffix = regexPorterStepTwo.exec(word)[2];

    if (regexMGreater0.test(stem)) {
      word = stem + SUFFIXES[suffix];
    }
  }

  if (regexPorterStepThree.test(word)) {
    const stem = regexPorterStepThree.exec(word)[1];
    const suffix = regexPorterStepThree.exec(word)[2];

    if (regexMGreater0.test(stem)) {
      word = stem + SUFFIXES[suffix];
    }
  }

  if (regexPorterStepFour.test(word)) {
    const stem = regexPorterStepFour.exec(word)[1];

    if (regexMGreater1.test(stem)) {
      word = stem;
    }
  } else if (regexEndsWithSionOrTion.test(word)) {
    const fullParts = regexEndsWithSionOrTion.exec(word);
    const stem = fullParts[1] + fullParts[2];

    if (regexMGreater1.test(stem)) {
      word = stem;
    }
  }

  if (regexPorterFive.test(word)) {
    const stem = regexPorterFive.exec(word)[1];

    if (
      regexMGreater1.test(stem) ||
      (regexMEqual1.test(stem) && !regexStemEndCVC.test(stem))
    ) {
      word = stem;
    }
  }

  if (regexEndsWithDoubleConsonant.test(word) && regexMGreater1.test(word)) {
    word = word.replace(/.$/, "");
  }

  if (firstCharacter === "y") {
    word = firstCharacter.toLowerCase() + word.slice(1);
  }

  return word;
}

module.exports = stemWord;
