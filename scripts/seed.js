const { faker } = require('@faker-js/faker')
const { ethers } = require('hardhat')
const fs = require('fs')

const toWei = (num) => ethers.parseEther(num.toString())

const dataCount = 5
const maxPrice = 3.5
const imagesUrls = [
"https://a0.muscache.com/im/pictures/38fe23e4-fb55-4d0a-a71b-f31d3fc61c6c.jpg?im_w=1200",
"https://a0.muscache.com/im/pictures/be8d84b7-f427-40ab-b7dd-1d87fdeda56f.jpg?im_w=720",
"https://a0.muscache.com/im/pictures/miso/Hosting-786480268921623461/original/1be0d172-bf79-41b7-ad84-0d62b9da4f38.jpeg?im_w=1200",
"https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6NTQzNTEzNDA%3D/original/e592522d-b288-4410-8149-8433c3c1a94c.jpeg?im_w=720",
"https://a0.muscache.com/im/pictures/miso/Hosting-832797497181783844/original/e40afe16-b842-4da2-9636-666a57840c75.png?im_w=1440",
"https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTExMjk5Nzk1Nzg2MzU4MzIzNQ%3D%3D/original/c881e0e9-d859-43d5-93f2-0e195ecf2f03.jpeg?im_w=1440",
"https://a0.muscache.com/im/pictures/miso/Hosting-12571408/original/e65516c3-1d02-4287-9eb3-ed36a1fa9c9f.jpeg?im_w=1440",
"https://a0.muscache.com/im/pictures/miso/Hosting-15306837/original/a236464a-1320-4d98-af6c-6d0702bd3184.jpeg?im_w=1440",
"https://a0.muscache.com/im/pictures/88f1381d-559a-4eed-88a3-ff6c1b8cbdb8.jpg?im_w=1200",

  
  'https://a0.muscache.com/im/pictures/309bee53-311d-4f07-a2e7-14daadbbfb77.jpg?im_w=720',
  'https://a0.muscache.com/im/pictures/miso/Hosting-660654516377752568/original/be407e38-ad1e-4b2b-a547-2185068229f6.jpeg?im_w=720',
  'https://a0.muscache.com/im/pictures/miso/Hosting-10989371/original/46c0c87f-d9bc-443c-9b64-24d9e594b54c.jpeg?im_w=1200',
  'https://a0.muscache.com/im/pictures/miso/Hosting-653943444831285144/original/73346136-e0bb-46a8-8ce4-a9fb5229e6b3.jpeg?im_w=720',
  'https://a0.muscache.com/im/pictures/71993873/b158891b_original.jpg?im_w=720',
  'https://a0.muscache.com/im/pictures/prohost-api/Hosting-686901689015576288/original/2cd072fa-8c03-4ef3-a061-268b9b957e28.jpeg?im_w=720',
  'https://a0.muscache.com/im/pictures/b88162e9-9ce3-4254-8129-2ea8719ab2c3.jpg?im_w=720',
  'https://a0.muscache.com/im/pictures/prohost-api/Hosting-585362898291824332/original/8a92bd09-9795-4586-bc32-6ab474d0922b.jpeg?im_w=720',
  'https://a0.muscache.com/im/pictures/3757edd0-8d4d-4d51-9d2e-3000e8c3797e.jpg?im_w=720',
  'https://a0.muscache.com/im/pictures/b7811ddd-b5e6-43ee-aa41-1fa28cf5ef95.jpg?im_w=720',
]

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

const generateFakeApartment = (count) => {
  const apartments = []
  for (let i = 0; i < count; i++) {
    const id = i + 1
    const name = faker.word.words(5)
    const deleted = faker.datatype.boolean()
    const description = faker.lorem.paragraph()
    const location = faker.lorem.word()
    const price = faker.number.float({
      min: 0.1,
      max: maxPrice,
      precision: 0.01,
    })
    const rooms = faker.number.int({ min: 2, max: 5 })
    const owner = faker.string.hexadecimal({
      length: { min: 42, max: 42 },
      prefix: '0x',
    })
    const timestamp = faker.date.past().getTime()
    const images = []

    for (let i = 0; i < 5; i++) {
      images.push(shuffleArray(imagesUrls)[0])
    }

    apartments.push({
      id,
      name,
      description,
      location,
      price: toWei(price),
      images: images.join(', '),
      rooms,
      owner,
      timestamp,
      deleted,
    })
  }

  return apartments
}

async function createApartments(contract, apartment) {
  const tx = await contract.createApartment(
    apartment.name,
    apartment.description,
    apartment.location,
    apartment.images,
    apartment.rooms,
    apartment.price
  )
  await tx.wait()
}

async function bookApartments(contract, aid, dates) {
  const tx = await contract.bookApartment(aid, dates, { value: toWei(maxPrice * dates.length) })
  await tx.wait()
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function main() {
  let dappBnbContract

  try {
    const contractAddresses = fs.readFileSync('./contracts/contractAddress.json', 'utf8')
    const { dappBnbContract: dappBnbAddress } = JSON.parse(contractAddresses)

    dappBnbContract = await ethers.getContractAt('DappBnb', dappBnbAddress)
    const dates1 = [1678492800000, 1678579200000, 1678665600000]

    // Process #1
    await Promise.all(
      generateFakeApartment(dataCount).map(async (apartment) => {
        await createApartments(dappBnbContract, apartment)
      })
    )

    await delay(3000) // Wait for 2.5 seconds

    // Process #2
    await Promise.all(
      Array(dataCount)
        .fill()
        .map(async (_, i) => {
          await bookApartments(dappBnbContract, i + 1, dates1)
        })
    )

    console.log('Items dummy data seeded...')
  } catch (error) {
    console.error('Unhandled error:', error)
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error)
  process.exitCode = 1
})