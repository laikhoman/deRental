const { faker } = require('@faker-js/faker')
const { ethers } = require('hardhat')
const fs = require('fs')

const toWei = (num) => ethers.parseEther(num.toString())

const dataCount = 5
const maxPrice = 3.5


const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
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