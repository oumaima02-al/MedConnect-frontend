/**
 * @typedef {Object} JwtResponse
 * @property {string} token
 * @property {string} type
 * @property {string} id
 * @property {string} email
 * @property {string[]} roles
 * @property {string} sessionId
 * @property {string} refreshToken
 */

/**
 * @typedef {Object} LoginChallenge
 * @property {boolean} requiresOtp
 * @property {string} email
 * @property {string} mfaMethod
 * @property {string} message
 */

/**
 * @typedef {Object} SessionInfo
 * @property {string} sessionId
 * @property {string} createdAt
 * @property {string} lastUsedAt
 * @property {string} expiresAt
 * @property {string} ipAddress
 * @property {string} userAgent
 */

/**
 * @typedef {Object} SessionListResponse
 * @property {SessionInfo[]} sessions
 * @property {number} count
 */

/**
 * @typedef {Object} UserResponse
 * @property {string} id
 * @property {string} nom
 * @property {string} prenom
 * @property {string} email
 * @property {string} [telephone]
 * @property {string[]} roles
 */

/**
 * @typedef {Object} PatientProfileResponse
 * @property {string} id
 * @property {string} userId
 * @property {string} [dateOfBirth]
 * @property {string} [bloodType]
 * @property {string} [insuranceNumber]
 * @property {string[]} [allergies]
 */

/**
 * @typedef {Object} DoctorProfileResponse
 * @property {string} id
 * @property {string} userId
 * @property {string} professionalRegistrationNumber
 * @property {string} nationalIdNumber
 * @property {string} [registrationAuthority]
 * @property {string} specialty
 * @property {string[]} [languages]
 * @property {string} [city]
 * @property {string} [clinicName]
 * @property {string} [cardFrontImageUrl]
 * @property {string} [cardBackImageUrl]
 * @property {string} [verificationStatus]
 * @property {string} [verificationNote]
 * @property {string} [verifiedAt]
 */

/**
 * @typedef {Object} PharmacistProfileResponse
 * @property {string} id
 * @property {string} userId
 * @property {string} professionalRegistrationNumber
 * @property {string} nationalIdNumber
 * @property {string} [registrationAuthority]
 * @property {string} pharmacyName
 * @property {string} [city]
 * @property {string} [openingHours]
 * @property {boolean} [deliveryAvailable]
 * @property {string} [cardFrontImageUrl]
 * @property {string} [cardBackImageUrl]
 * @property {string} [verificationStatus]
 * @property {string} [verificationNote]
 * @property {string} [verifiedAt]
 */

/**
 * @typedef {Object} ProfessionalDocumentResponse
 * @property {string} id
 * @property {string} userId
 * @property {string} profileType
 * @property {string} side
 * @property {string} originalFilename
 * @property {string} contentType
 * @property {number} sizeBytes
 * @property {number} version
 * @property {boolean} active
 * @property {string} scanStatus
 * @property {string} uploadedAt
 * @property {string} downloadUrl
 */

/**
 * @typedef {Object} SubscriptionResponse
 * @property {string} id
 * @property {string} userId
 * @property {string} planType
 * @property {string} status
 * @property {number} maxPatients
 * @property {number} maxAppointmentsPerMonth
 */

/**
 * @typedef {Object} ClinicAccountResponse
 * @property {string} id
 * @property {string} name
 * @property {string} siretNumber
 * @property {string} ownerUserId
 * @property {string[]} teamMemberIds
 */

/**
 * @typedef {Object} BulkImportResponse
 * @property {string} id
 * @property {string} userId
 * @property {string} fileName
 * @property {string} status
 * @property {number} totalRows
 * @property {number} successCount
 * @property {number} failedCount
 * @property {string[]} errors
 */

export {};
