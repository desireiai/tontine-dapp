// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

enum MemberLevel { STANDARD, PREMIUM, VIP }
enum MemberStatus { ACTIVE, BENEFITED, SUSPENDED, EXCLUDED }

contract TontineMembership is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant PRESIDENT_ROLE = keccak256("PRESIDENT_ROLE");
    uint256 private _tokenIdCounter;

struct Memberinfo {
    string name;             // Reste en haut (type dynamique)
    uint256 montantCotisation;
    uint256 caution;
    address avaliseur;
    
    // --- Bloc optimisé (Packé dans 1 seul slot de 32 octets) ---
    uint64 createdAt;        // Suffisant pour les 500 prochaines années
    uint64 lastTransferAt;   // Idem
    uint32 position;         // Jusqu'à 4 milliards de membres
    uint16 penaltiesAccumulated; // Jusqu'à 65 535 pénalités
    uint8 partsCount;        // Jusqu'à 255 parts
    MemberStatus status;     // uint8 en interne
    MemberLevel level;       // uint8 en interne
    // ---------------------------------------------------------

    string ipfsHash;
    address[] previousOwners;
}

    mapping(uint256 => Memberinfo) public members;
    mapping(address => uint256[]) public memberTokens;
    mapping(address => uint256) public avalisationCount;
    mapping(address => address[]) public avalisedMembers;

    uint8 public constant MAX_PARTS_PER_MEMBER = 2;
    uint8 public constant MAX_AVALISATION_PER_MEMBER = 3;

    event MemberCreated(uint256 indexed tokenId, address indexed member, address indexed avaliseur, string name, MemberLevel level);
    event PositionUpdated(uint256 indexed tokenId, uint256 oldPosition, uint256 newPosition);
    event MemberStatusChanged(uint256 indexed tokenId, MemberStatus oldStatus, MemberStatus newStatus);

    constructor(address admin, string memory tontineName, string memory tontineSymbol) ERC721(tontineName, tontineSymbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PRESIDENT_ROLE, admin);
        _tokenIdCounter = 1;
    }

    // ============ MODIFICATEURS ============
    modifier onlyValidToken(uint256 tokenId) {
        require(_ownerOf(tokenId) != address(0), "Token inexistant");
        _;
    }

    // ============ FONCTIONS DE GESTION (AVALISATION) ============

    function updatePosition(uint256 tokenId, uint32 newPosition) external onlyRole(PRESIDENT_ROLE) onlyValidToken(tokenId) {
        uint32 oldPosition = members[tokenId].position;
        members[tokenId].position = newPosition;
        emit PositionUpdated(tokenId, oldPosition, newPosition);
    }

    function markAsBenefited(uint256 tokenId) external onlyRole(PRESIDENT_ROLE) onlyValidToken(tokenId) {
        MemberStatus oldStatus = members[tokenId].status;
        members[tokenId].status = MemberStatus.BENEFITED;
        emit MemberStatusChanged(tokenId, oldStatus, MemberStatus.BENEFITED);
    }

    function addPenalty(uint256 tokenId, uint16 amount) external onlyRole(PRESIDENT_ROLE) onlyValidToken(tokenId) {
        members[tokenId].penaltiesAccumulated += amount;
    }

    // ============ LOGIQUE DE TRANSFERT & NETTOYAGE ============

    function mintMembership(
    address to, 
    string calldata name, 
    address avaliseur, 
    uint256 montantCotisation, 
    MemberLevel level, 
    uint256 caution, 
    string calldata ipfsHash, 
    string calldata uri
) public onlyRole(PRESIDENT_ROLE) {
    require(to != address(0), "Adresse invalide");
    require(avaliseur != address(0), "Avaliseur requis");
    require(avalisationCount[avaliseur] < MAX_AVALISATION_PER_MEMBER, "Limite d'avalisation");

    uint256 tokenId = _tokenIdCounter++;
    _safeMint(to, tokenId);

    // Attribution directe pour éviter de charger trop de variables sur la stack
    Memberinfo storage m = members[tokenId];
    m.name = name;
    m.montantCotisation = montantCotisation;
    m.caution = caution;
    m.avaliseur = avaliseur;
    m.createdAt = uint64(block.timestamp);
    m.lastTransferAt = uint64(block.timestamp);
    m.position = uint32(tokenId);
    m.status = MemberStatus.ACTIVE;
    m.level = level;
    m.ipfsHash = ipfsHash;
    m.partsCount = uint8(memberTokens[to].length + 1);

    _setTokenURI(tokenId, uri);
    memberTokens[to].push(tokenId);
    avalisationCount[avaliseur] += 1;
    avalisedMembers[avaliseur].push(to);
    
   emit MemberCreated(tokenId, to, m.avaliseur, m.name, m.level);
}

    function _update(address to, uint256 tokenId, address auth) internal override(ERC721) returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            members[tokenId].lastTransferAt = uint64(block.timestamp);
            members[tokenId].previousOwners.push(from);
            _removeTokenFromOwner(from, tokenId);
            memberTokens[to].push(tokenId);
        }
        return super._update(to, tokenId, auth);
    }

    function _removeTokenFromOwner(address owner, uint256 tokenId) internal {
        uint256[] storage tokens = memberTokens[owner];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }
    }

    // ============ LECTURE ============
    function getTokensOf(address owner) external view returns (uint256[] memory) {
        return memberTokens[owner];
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

contract TontineFactory {
    address[] public allTontines;
    event TontineCreated(address indexed tontineAddress, address indexed president, string name);

    function createTontine(string memory _name, string memory _symbol) public {
        TontineMembership newTontine = new TontineMembership(msg.sender, _name, _symbol);
        allTontines.push(address(newTontine));
        emit TontineCreated(address(newTontine), msg.sender, _name);
    }
        // Fonction pour voir combien de tontines existent
    function getTontinesCount() public view returns (uint256) {
        return allTontines.length;
    }
}