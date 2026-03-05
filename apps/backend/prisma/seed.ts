import {
  Animal,
  AnimalSex,
  AnimalStatus,
  ApplicationStatus,
  ApplicationType,
  HousingType,
  PfcUser,
  PrismaClient,
  UserRole,
} from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Démarrage du Seed...");

  // ===========================================================
  // 1. NETTOYAGE DE LA BASE (ordre inverse des dépendances)
  // ===========================================================
  console.log("🧹 Nettoyage de la base de données...");
  await prisma.bookmark.deleteMany();
  await prisma.application.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.individualProfile.deleteMany();
  await prisma.shelterProfile.deleteMany();
  await prisma.species.deleteMany();
  await prisma.pfcUser.deleteMany();

  // ===========================================================
  // 2. MOT DE PASSE PAR DÉFAUT (HASHÉ)
  // ===========================================================
  const passwordHash = await argon2.hash("Password123!");

  // ===========================================================
  // 3. CRÉATION DE L'ADMIN
  // ===========================================================
  console.log("👑 Création de l’Admin...");
  await prisma.pfcUser.create({
    data: {
      email: "admin@pfc.fr",
      password: passwordHash,
      role: UserRole.admin,
      phoneNumber: "0999999999",
      address: "Siège PFC - Paris",
    },
  });

  // ===========================================================
  // 4. DONNÉES DE RÉFÉRENCE (ESPÈCES)
  // ===========================================================
  console.log("🐾 Création des Espèces...");
  const dog = await prisma.species.create({ data: { name: "Chien" } });
  const cat = await prisma.species.create({ data: { name: "Chat" } });
  const rabbit = await prisma.species.create({ data: { name: "Lapin" } });

  const speciesList = [dog, cat, rabbit];

  // ===========================================================
  // 5. CRÉATION DES REFUGES
  // ===========================================================
  console.log("🏥 Création des Refuges...");
  const shelters: PfcUser[] = [];

  const shelterData = [
    { name: "SPA Paris", siret: "12345678900011", address: "39 Boulevard Berthier, 75017 Paris" },
    {
      name: "Refuge Saint-Roch",
      siret: "12345678900012",
      address: "12 Rue de l’Espérance, 34000 Montpellier",
    },
    { name: "L’Ami Fidèle", siret: "12345678900013", address: "5 Avenue des Animaux, 69000 Lyon" },
    {
      name: "Solana Protection",
      siret: "12345678900014",
      address: "1 bis Rue du Chat, 33000 Bordeaux",
    },
    {
      name: "Le Repaire des Griffes",
      siret: "12345678900015",
      address: "10 Chemin de la Ferme, 59000 Lille",
    },
  ];

  for (const item of shelterData) {
    const shelter = await prisma.pfcUser.create({
      data: {
        email: `contact@${item.name.toLowerCase().replace(/\s/g, "-")}.fr`,
        password: passwordHash,
        role: UserRole.shelter,
        phoneNumber: "0102030405",
        address: item.address,
        shelterProfile: {
          create: {
            siret: item.siret,
            shelterName: item.name,
            description: `Bienvenue chez ${item.name}. Nous œuvrons pour le bien-être animal depuis plus de 10 ans.`,
            logo: `https://api.dicebear.com/7.x/initials/svg?seed=${item.name}`,
          },
        },
      },
    });
    shelters.push(shelter);
  }

  // ===========================================================
  // 6. CRÉATION DES FAMILLES (INDIVIDUALS)
  // ===========================================================
  console.log("🏠 Création des Familles...");
  const individuals: PfcUser[] = [];

  for (let i = 1; i <= 5; i++) {
    const individual = await prisma.pfcUser.create({
      data: {
        email: `famille.${i}@email.com`,
        password: passwordHash,
        role: UserRole.individual,
        phoneNumber: `060000000${i}`,
        address: `${i} rue des Lilas, 75000 Paris`,
        individualProfile: {
          create: {
            housingType: i % 2 === 0 ? HousingType.apartment : HousingType.house,
            surface: 40 + i * 15,
            haveGarden: i % 2 !== 0,
            haveAnimals: i > 2,
            haveChildren: i === 1 || i === 5,
            availableFamily: true,
            availableTime: "Disponible le soir en semaine et les week-ends.",
          },
        },
      },
    });
    individuals.push(individual);
  }

  // ===========================================================
  // 7. CRÉATION DES ANIMAUX
  // ===========================================================
  console.log("🐶🐱🐰 Création des Animaux...");
  const animalNames = [
    "Boby",
    "Luna",
    "Filou",
    "Rex",
    "Mimi",
    "Oscar",
    "Bella",
    "Simba",
    "Nala",
    "Rocky",
    "Zoe",
    "Max",
    "Daisy",
    "Jack",
    "Lola",
    "Pluto",
    "Maya",
    "Titi",
    "Gribouille",
    "Cookie",
    "Caramel",
    "Nitro",
    "Shadow",
    "Praline",
    "Pixel",
  ];

  const treatmentsList = [
    "Vaccins à jour.",
    "Traitement antiparasitaire récent.",
    "Suivi vétérinaire léger requis.",
    "Régime alimentaire spécifique.",
    "Aucun traitement en cours.",
    "Stérilisation prévue.",
  ];

  const createdAnimals: Animal[] = [];
  let animalIndex = 0;

  for (const shelter of shelters) {
    for (let i = 0; i < 5; i++) {
      const name = animalNames[animalIndex % animalNames.length];
      const species = speciesList[animalIndex % speciesList.length];

      const keyword = species.name === "Chien" ? "dog" : species.name === "Chat" ? "cat" : "rabbit";

      const animal = await prisma.animal.create({
        data: {
          name,
          age: `${Math.floor(Math.random() * 10) + 1} ans`,
          sex: i % 2 === 0 ? AnimalSex.male : AnimalSex.female,
          weight: species.name === "Chien" ? 18.5 : species.name === "Chat" ? 4.2 : 2.3,
          height: species.name === "Chien" ? 55 : species.name === "Chat" ? 28 : 25,
          description: `Voici ${name}, un adorable ${species.name.toLowerCase()} en attente d'une famille.`,
          animalStatus: AnimalStatus.available,
          photos: [
            `https://loremflickr.com/500/500/${keyword}?lock=${animalIndex * 3 + 1}`,
            `https://loremflickr.com/500/500/${keyword},cute?lock=${animalIndex * 3 + 2}`,
            `https://loremflickr.com/500/500/${keyword},pet?lock=${animalIndex * 3 + 3}`,
          ],
          acceptOtherAnimals: i % 3 !== 0,
          acceptChildren: true,
          needGarden: species.name === "Chien" && i % 2 === 0,
          treatment: treatmentsList[i % treatmentsList.length],
          speciesId: species.id,
          pfcUserId: shelter.id,
        },
      });

      createdAnimals.push(animal);
      animalIndex++;
    }
  }

  // ===========================================================
  // 8. CRÉATION DES FAVORIS
  // ===========================================================
  console.log("❤️ Création des Favoris...");
  await prisma.bookmark.create({
    data: { pfcUserId: individuals[0].id, animalId: createdAnimals[0].id },
  });
  await prisma.bookmark.create({
    data: { pfcUserId: individuals[0].id, animalId: createdAnimals[1].id },
  });

  // ===========================================================
  // 9. CRÉATION DES DEMANDES
  // ===========================================================
  console.log("📝 Création des Demandes...");
  await prisma.application.create({
    data: {
      pfcUserId: individuals[1].id,
      animalId: createdAnimals[2].id,
      message: "Nous avons eu un coup de cœur.",
      applicationType: ApplicationType.adoption,
      applicationStatus: ApplicationStatus.pending,
    },
  });

  await prisma.application.create({
    data: {
      pfcUserId: individuals[2].id,
      animalId: createdAnimals[3].id,
      message: "Disponible en famille d’accueil.",
      applicationType: ApplicationType.foster,
      applicationStatus: ApplicationStatus.approved,
    },
  });

  await prisma.application.create({
    data: {
      pfcUserId: individuals[3].id,
      animalId: createdAnimals[4].id,
      message: "Je le veux !",
      applicationType: ApplicationType.adoption,
      applicationStatus: ApplicationStatus.rejected,
    },
  });

  console.log("✅ Seed terminé avec succès !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
