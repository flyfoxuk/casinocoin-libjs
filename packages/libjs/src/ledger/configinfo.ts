export type TokenConfigData = {
  ApiEndpoint: string,
  ContactEmail: string,
  Flags: number,
  FullName: string,
  IconURL: string,
  Issuer: string,
  Token: string,
  TotalSupply: string,
  Website: string
}

export type KYCConfigData = {
  Account: string
}

export type PubKeyConfigData = {
  PublicKey: string
}

export type Configuration = {
  ConfigID: number,
  ConfigType: 'Token' | 'Message_PubKey' | 'KYC_Signer',
  ConfigData: TokenConfigData | KYCConfigData | PubKeyConfigData
}

function getConfigInfo(configType: string): Promise<Configuration[]> {

  return this.connection.request(
    {command: 'config_info', ledger_index: 'validated'}).then(response => {
    const configs: Configuration[] = []
    response.configuration.forEach(element => {
      if (element.ConfigType === configType) {
        if (element.ConfigType === 'Token') {
          element.ConfigData.forEach(subelement => {
            const item: TokenConfigData = {
              ApiEndpoint: subelement.apiEndpoint,
              ContactEmail: subelement.contactEmail,
              Flags: subelement.flags,
              FullName: subelement.fullName,
              IconURL: subelement.iconURL,
              Issuer: subelement.issuer,
              Token: subelement.token,
              TotalSupply: subelement.totalSupply,
              Website: subelement.website
            }
            configs.push(
              { ConfigID: element.ConfigID,
                ConfigType: element.ConfigType,
                ConfigData: item
              }
            )
          })
        } else if (element.ConfigType === 'KYC_Signer') {
          element.ConfigData.forEach(subelement => {
            const item: KYCConfigData = {
              Account: subelement.account
            }
            configs.push(
              { ConfigID: element.ConfigID,
                ConfigType: element.ConfigType,
                ConfigData: item
              }
            )
          })
        } else if (element.ConfigType === 'Message_PubKey') {
          element.ConfigData.forEach(subelement => {
            const item: PubKeyConfigData = {
              PublicKey: subelement.account
            }
            configs.push(
              { ConfigID: element.ConfigID,
                ConfigType: element.ConfigType,
                ConfigData: item
              })
          })
        }
      }
    })
    return configs
  })
}

export default getConfigInfo
