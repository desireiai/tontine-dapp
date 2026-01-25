// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
//Je veux importer un smartcontract ERC721 d'OpenZeppelin comme standard pour mon contrat afin de creer un token non fongible (NFT)
//cela permettra de representer l'adhesion a une tontine sous forme de NFT une adresse unique sur la blockchain
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
//je vais importer cette extension pour stocker photo,carte d'identité des membres de la tontine 
import "@openzeppelin/contracts/access/ERC721URIStorage.sol";
import "@openzeppelin/contracts/Access/AccessControl.sol";

contract TontineMembership is ERC721, ERC721URIStorage, AccessControl {
    //je vais definir un role pour l'administrateur de la tontine
    bytes32 public constant ADMIN_ROLE = keccak256("PRESIDENT_ROLE");
    uint256 private _tokenIdCounter;
    Struct Membership {
        string name;
        uint256 montantCotisation; //c'est le value car c'est la valeur financiere de l'adhesion a la tontine
        address avaliseur;
        string typecontrat; //carte de membre
        uint256 caution; //caution pour garantir l'engagement du membre selon le pack choisi
        address memberAddress;
        uint256 createdAt;              // Timestamp de création
        uint256 lastTransferAt;         // Timestamp du dernier transfert
        string  status; // actif, inactif, suspendu
        string  ipfsHash; // Hash IPFS des documents du membre
        address[] previousOwners;       // Liste des anciens propriétaires
        uint256 penaltiesAccumulated;   // Pénalités accumulées
        uint8 partsCount;               // Nombre de parts (max 2)
        string  uri; // URI pointant vers les metadonnees du NFT
    }

    constructor() ERC721("TontineMembership", "TONTINE") {
        //l'administrateur du contrat est celui qui le deploye
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    //fonction pour mint un nouveau NFT d'adhesion a la tontine
    function mintMembership(address to, string memory uri) public onlyRole(ADMIN_ROLE) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter += 1;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    //les fonctions suivantes sont overrides requises par Solidity
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}