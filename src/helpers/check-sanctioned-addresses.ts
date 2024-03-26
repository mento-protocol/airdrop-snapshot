import chalk from 'chalk'
import { parse } from 'csv-parse'
import * as fs from 'node:fs'
import * as https from 'node:https'

const downloadSanctionsList = async () => {
  return new Promise<string>((resolve, reject) => {
    let sanctionsData = ''
    console.log('Downloading OFAC Sanctions List...')
    https
      .get(
        'https://www.treasury.gov/ofac/downloads/sanctions/1.0/sdn_advanced.xml',
        (response) => {
          response.on('data', (chunk) => {
            sanctionsData += chunk
          })

          response.on('end', () => {
            console.log('Download Completed')
            resolve(sanctionsData)
          })
        }
      )
      .on('error', (err) => {
        reject(err)
      })
  })
}

const removeDuplicates = (arr: string[]) => {
  return [...new Set(arr)]
}

const extractSanctionedAddresses = (xmlData: string) => {
  console.log('Extracting addresses from the sanctions list...')
  const regex = /<VersionDetail DetailTypeID="1432">0x/gi // Regex based on the XML structure
  let result,
    indices = []

  while ((result = regex.exec(xmlData))) {
    indices.push(result.index)
  }

  let addresses = []
  for (let i = 0; i < indices.length; i++) {
    addresses.push(
      xmlData.substring(indices[i] + 35, indices[i] + 77).toLowerCase()
    ) // Assuming the addresses are 42 characters long
  }
  addresses = removeDuplicates(addresses)
  console.log('Total sanctioned addresses extracted: ', addresses.length)
  return addresses
}

const loadCsvFile = async (filePath: string) => {
  return new Promise<string[]>((resolve, reject) => {
    let addresses: string[] = []
    console.log('Loading addresses from snapshot CSV file...')
    fs.createReadStream(filePath)
      .pipe(parse())
      .on('data', (row) => {
        addresses.push(row[0].toLowerCase()) // Assuming the first column contains addresses
      })
      .on('end', () => {
        console.log('Addresses loaded from CSV:', addresses.length)
        resolve(addresses)
      })
      .on('error', (error) => {
        reject(error)
      })
  })
}

const checkAddresses = async () => {
  try {
    const sanctionsData = await downloadSanctionsList()
    const sanctionedAddresses = extractSanctionedAddresses(sanctionsData)

    const csvFilePath = './final-snapshots/airdrop-amounts-per-address.csv'
    const addressesFromCsv = await loadCsvFile(csvFilePath)

    const sanctionedAddressesSet = new Set(sanctionedAddresses)
    const foundInSanctions = addressesFromCsv.filter((address) =>
      sanctionedAddressesSet.has(address)
    )

    if (foundInSanctions.length > 0) {
      console.log('Addresses found in sanctions:', foundInSanctions)
    } else {
      console.log(chalk.bold('No sanctioned addresses found in the CSV.'))
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

checkAddresses()
