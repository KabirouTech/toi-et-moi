export interface Question {
  index: number;
  set: 1 | 2 | 3;
  text: string;
}

export const QUESTIONS: Question[] = [
  // Série I (questions 1-12) : de plus en plus personnel
  {
    index: 1,
    set: 1,
    text: 'Si vous pouviez inviter n\u2019importe qui au monde à dîner, qui choisiriez-vous ?',
  },
  {
    index: 2,
    set: 1,
    text: 'Aimeriez-vous être célèbre ? De quelle manière ?',
  },
  {
    index: 3,
    set: 1,
    text: 'Avant de passer un appel téléphonique, vous arrive-t-il de répéter ce que vous allez dire ? Pourquoi ?',
  },
  {
    index: 4,
    set: 1,
    text: 'À quoi ressemblerait une journée « parfaite » pour vous ?',
  },
  {
    index: 5,
    set: 1,
    text: 'Quand avez-vous chanté pour la dernière fois pour vous-même ? Pour quelqu\u2019un d\u2019autre ?',
  },
  {
    index: 6,
    set: 1,
    text: 'Si vous pouviez vivre jusqu\u2019à 90 ans et conserver soit l\u2019esprit soit le corps d\u2019une personne de 30 ans pendant les 60 dernières années de votre vie, que choisiriez-vous ?',
  },
  {
    index: 7,
    set: 1,
    text: 'Avez-vous un pressentiment secret sur la façon dont vous allez mourir ?',
  },
  {
    index: 8,
    set: 1,
    text: 'Citez trois choses que vous et votre partenaire semblez avoir en commun.',
  },
  {
    index: 9,
    set: 1,
    text: 'Pour quoi dans votre vie êtes-vous le plus reconnaissant(e) ?',
  },
  {
    index: 10,
    set: 1,
    text: 'Si vous pouviez changer quelque chose dans la façon dont vous avez été élevé(e), qu\u2019est-ce que ce serait ?',
  },
  {
    index: 11,
    set: 1,
    text: 'Prenez quatre minutes et racontez à votre partenaire l\u2019histoire de votre vie avec le plus de détails possible.',
  },
  {
    index: 12,
    set: 1,
    text: 'Si vous pouviez vous réveiller demain en ayant acquis une qualité ou une capacité, laquelle serait-ce ?',
  },

  // Série II (questions 13-24) : plus personnel
  {
    index: 13,
    set: 2,
    text: 'Si une boule de cristal pouvait vous révéler la vérité sur vous-même, votre vie, l\u2019avenir ou quoi que ce soit d\u2019autre, que voudriez-vous savoir ?',
  },
  {
    index: 14,
    set: 2,
    text: 'Y a-t-il quelque chose que vous rêvez de faire depuis longtemps ? Pourquoi ne l\u2019avez-vous pas encore fait ?',
  },
  {
    index: 15,
    set: 2,
    text: 'Quelle est la plus grande réalisation de votre vie ?',
  },
  {
    index: 16,
    set: 2,
    text: 'Qu\u2019est-ce que vous valorisez le plus dans une amitié ?',
  },
  {
    index: 17,
    set: 2,
    text: 'Quel est votre souvenir le plus précieux ?',
  },
  {
    index: 18,
    set: 2,
    text: 'Quel est votre souvenir le plus terrible ?',
  },
  {
    index: 19,
    set: 2,
    text: 'Si vous saviez que dans un an vous alliez mourir subitement, changeriez-vous quelque chose à votre façon de vivre actuelle ? Pourquoi ?',
  },
  {
    index: 20,
    set: 2,
    text: 'Que signifie l\u2019amitié pour vous ?',
  },
  {
    index: 21,
    set: 2,
    text: 'Quel rôle jouent l\u2019amour et l\u2019affection dans votre vie ?',
  },
  {
    index: 22,
    set: 2,
    text: 'Partagez à tour de rôle quelque chose que vous considérez comme une qualité positive de votre partenaire. Partagez cinq éléments au total.',
  },
  {
    index: 23,
    set: 2,
    text: 'Votre famille est-elle proche et chaleureuse ? Avez-vous le sentiment que votre enfance a été plus heureuse que celle de la plupart des gens ?',
  },
  {
    index: 24,
    set: 2,
    text: 'Comment vous sentez-vous par rapport à votre relation avec votre mère ?',
  },

  // Série III (questions 25-36) : le plus personnel
  {
    index: 25,
    set: 3,
    text: 'Formulez chacun trois affirmations commençant par « nous ». Par exemple : « Nous sommes tous les deux dans cette pièce et nous ressentons... »',
  },
  {
    index: 26,
    set: 3,
    text: 'Complétez cette phrase : « J\u2019aimerais avoir quelqu\u2019un avec qui je pourrais partager... »',
  },
  {
    index: 27,
    set: 3,
    text: 'Si vous deviez devenir un(e) ami(e) proche de votre partenaire, partagez ce qu\u2019il serait important qu\u2019il/elle sache.',
  },
  {
    index: 28,
    set: 3,
    text: 'Dites à votre partenaire ce que vous aimez chez lui/elle ; soyez très honnête cette fois, en disant des choses que vous ne diriez peut-être pas à quelqu\u2019un que vous venez de rencontrer.',
  },
  {
    index: 29,
    set: 3,
    text: 'Partagez avec votre partenaire un moment embarrassant de votre vie.',
  },
  {
    index: 30,
    set: 3,
    text: 'Quand avez-vous pleuré pour la dernière fois devant quelqu\u2019un ? Tout(e) seul(e) ?',
  },
  {
    index: 31,
    set: 3,
    text: 'Dites à votre partenaire quelque chose que vous aimez déjà chez lui/elle.',
  },
  {
    index: 32,
    set: 3,
    text: 'Y a-t-il quelque chose de trop sérieux pour en plaisanter ?',
  },
  {
    index: 33,
    set: 3,
    text: 'Si vous deviez mourir ce soir sans possibilité de communiquer avec qui que ce soit, qu\u2019est-ce que vous regretteriez le plus de ne pas avoir dit à quelqu\u2019un ? Pourquoi ne le lui avez-vous pas encore dit ?',
  },
  {
    index: 34,
    set: 3,
    text: 'Votre maison, contenant tout ce que vous possédez, prend feu. Après avoir sauvé vos proches et vos animaux, vous avez le temps de faire un dernier aller-retour pour sauver un seul objet. Lequel serait-ce ? Pourquoi ?',
  },
  {
    index: 35,
    set: 3,
    text: 'Parmi tous les membres de votre famille, la mort de qui vous perturberait le plus ? Pourquoi ?',
  },
  {
    index: 36,
    set: 3,
    text: 'Partagez un problème personnel et demandez conseil à votre partenaire sur la façon dont il/elle le gérerait. Demandez aussi à votre partenaire de vous refléter ce que vous semblez ressentir à propos du problème que vous avez choisi.',
  },
];
