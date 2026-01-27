// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
//Je veux importer un smartcontract ERC721 d'OpenZeppelin comme standard pour mon contrat afin de creer un token non fongible (NFT)
//cela permettra de representer l'adhesion a une tontine sous forme de NFT une adresse unique sur la blockchain

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
//je vais importer cette extension pour stocker photo,carte d'identité des membres de la tontine 

   //liste des enums pour le statut des membres
    enum MemberLevel { STANDARD, PREMIUM, VIP }
    enum MemberStatus { ACTIVE, BENEFITED, SUSPENDED, EXCLUDED }
contract TontineMembership is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant PRESIDENT_ROLE = keccak256("PRESIDENT_ROLE");
    uint256 private _tokenIdCounter;
    struct Memberinfo {
        string name;
        uint256 montantCotisation;
        address avaliseur;
        uint256 caution;
        uint256 createdAt;
        uint256 lastTransferAt;
        MemberStatus status;
        MemberLevel level;
        string ipfsHash;
        address[] previousOwners;
        uint256 penaltiesAccumulated;
        uint8 partsCount;
        string uri;
    }

    // 3. LES MAPPINGS CORRIGÉS
    mapping(uint256 => Memberinfo) public members;
    mapping(address => uint256[]) public memberTokens;
    mapping(address => uint256) public avalisationCount;
    mapping(address => address[]) public avalisedMembers; // Corrigé : address en clé

    uint8 public constant MAX_PARTS_PER_MEMBER = 2;
    uint8 public constant MAX_AVALISATION_PER_MEMBER = 3;
    
    // ... reste du code (events, modifiers, constructor, mint)
    //les events pour suivre les actions importantes
    event MemberCreated(
        uint256 indexed tokenId,
        address indexed member,
        address indexed avaliseur,
        string name,
        MemberLevel level
    );
    
    event MemberStatusChanged(
        uint256 indexed tokenId,
        MemberStatus oldStatus,
        MemberStatus newStatus
    );
    
    event PositionUpdated(
        uint256 indexed tokenId,
        uint256 oldPosition,
        uint256 newPosition
    );
    
    event MetadataUpdated(
        uint256 indexed tokenId,
        string newIpfsHash
    );

    // ============ MODIFICATEURS ============
// 1. Vérifier l'existence (Version compatible 2024+)
modifier onlyValidMember(uint256 tokenId) {
    // _ownerOf renvoie l'adresse du proprio ou 0 si le token n'existe pas
    require(_ownerOf(tokenId) != address(0), "Ce membre n'existe pas");
    _;
}

// 2. Vérifier le statut (Dépend du premier !)
modifier onlyActiveMember(uint256 tokenId) {
    // On vérifie d'abord s'il existe pour éviter de lire une structure vide
    require(_ownerOf(tokenId) != address(0), "Token inexistant");
    require(members[tokenId].status == MemberStatus.ACTIVE, "Action impossible : membre non actif");
    _;
}

    constructor() ERC721("TontineMembership", "TONTINE") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PRESIDENT_ROLE, msg.sender);
        _tokenIdCounter = 1; //commencer a 1 pour eviter le tokenId 0
    }
 
    //fonction pour mint un nouveau NFT d'adhesion a la tontine
    function mintMembership(address to,
     string memory name,
     address avaliseur,
     uint256 montantCotisation,
     MemberLevel level,
     uint256 caution,
     string memory ipfsHash,
     string memory uri
     )
     public onlyRole(PRESIDENT_ROLE) {
         require(to != address(0), "Adresse invalide");
        require(avaliseur != address(0), "Avaliseur requis");
        require(avaliseur != to, "Auto-avalisation interdite");
        require(
            avalisationCount[avaliseur] < MAX_AVALISATION_PER_MEMBER,
            "Limite d'avalisation atteinte"
        );
        require(
            memberTokens[to].length < MAX_PARTS_PER_MEMBER,
            "Limite de parts atteinte"
        );               
         uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter += 1;
        _safeMint(to, tokenId);
        Memberinfo memory newMember = Memberinfo({
            name: name,
            montantCotisation: montantCotisation,
            avaliseur: avaliseur,
            caution: caution,
            level: level,
            createdAt: block.timestamp,
            lastTransferAt: block.timestamp,
            status: MemberStatus.ACTIVE,
            ipfsHash: ipfsHash,
            previousOwners: new address[](0),
            penaltiesAccumulated: 0,
            partsCount: uint8(memberTokens[to].length + 1),
            uri: uri
        });      
        members[tokenId] = newMember;
        _setTokenURI(tokenId, uri);
        memberTokens[to].push(tokenId);
        avalisationCount[avaliseur] += 1;
        avalisedMembers[avaliseur].push(to);
        emit MemberCreated(tokenId, to, avaliseur, name, level);
    }

    //les fonctions suivantes sont overrides requises par Solidity

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

