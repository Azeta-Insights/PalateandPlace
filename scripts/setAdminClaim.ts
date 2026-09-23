import { adminAuth } from '../server/firebaseAdmin';

/**
 * Standalone utility script to programmatically assign the `admin: true`
 * custom claim to the designated administrator account via Firebase Admin SDK.
 *
 * Usage:
 *   npx tsx scripts/setAdminClaim.ts [adminEmail]
 */
async function setAdminClaim() {
  const targetEmail = process.argv[2] || 'blessing.waydiva@gmail.com';
  console.log(`Setting admin: true custom claim for: ${targetEmail}...`);

  try {
    let user;
    try {
      user = await adminAuth.getUserByEmail(targetEmail);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        console.log(`User ${targetEmail} not found in Firebase Auth. Creating user record...`);
        user = await adminAuth.createUser({
          email: targetEmail,
          emailVerified: true,
          displayName: 'Administrator'
        });
        console.log(`Created user record for ${targetEmail} with UID: ${user.uid}`);
      } else {
        throw err;
      }
    }

    // Set custom user claims
    await adminAuth.setCustomUserClaims(user.uid, {
      admin: true
    });

    // Verify claims
    const updatedUser = await adminAuth.getUser(user.uid);
    console.log(`Successfully assigned custom claims to UID ${user.uid}:`, updatedUser.customClaims);
    console.log(`Admin authorization status: ${updatedUser.customClaims?.admin === true ? 'ACTIVE' : 'FAILED'}`);
    process.exit(0);
  } catch (error: any) {
    console.error('Error assigning admin custom claim:', error);
    process.exit(1);
  }
}

setAdminClaim();
