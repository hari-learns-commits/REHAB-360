/**
 * Standardized Clinical Injury Taxonomy (OSIICS v11 / OSICS v10)
 * Endorsed by the International Olympic Committee (IOC) Consensus Statements.
 */

export const INJURY_TAXONOMIES = [
  {
    code: 'KJAC',
    bodyRegion: 'Knee',
    tissueType: 'Joint / Ligament',
    pathology: 'Anterior Cruciate Ligament (ACL) Complete Rupture',
    description: 'Acute complete tear of the anterior cruciate ligament with rotational knee instability.',
    commonSurgeries: ['ACL Reconstruction (Bone-Patellar Tendon-Bone / Hamstring Autograft)'],
    phases: [
      {
        phaseNumber: 1,
        phaseName: 'Immediate Post-Op Recovery & Protection',
        weeks: '0 - 4 weeks',
        goals: 'Resolve joint effusion, restore terminal extension (0°), eliminate extensor lag.',
        clearanceCriteria: {
          passiveExtension: '0°',
          activeFlexion: '≥ 90°',
          strokeTestEffusion: '≤ 1+',
          straightLegRaiseLag: '0° lag'
        },
        riskThresholds: {
          extensionDeficit: '> 5°',
          quadricepsInhibition: 'Knee flexion in stance'
        }
      },
      {
        phaseNumber: 2,
        phaseName: 'Strength & Neuromuscular Control',
        weeks: '5 - 12 weeks',
        goals: 'Hypertrophy, unilateral quadriceps/hamstring capacity, dynamic alignment.',
        clearanceCriteria: {
          limbSymmetryIndex: '≥ 80%',
          singleLegBalance: '≥ 30s (eyes open)'
        },
        riskThresholds: {
          dynamicValgus: '> 5° medial collapse',
          pelvicDrop: 'Positive Trendelenburg'
        }
      },
      {
        phaseNumber: 3,
        phaseName: 'Impact, Running & Plyometrics',
        weeks: '12 - 24 weeks',
        goals: 'Plyometric force absorption, linear/multidirectional speed symmetry.',
        clearanceCriteria: {
          limbSymmetryIndex: '≥ 90% (Hop Tests)',
          groundContactTimeAsymmetry: '< 10%'
        },
        riskThresholds: {
          stiffLandingFlexion: '< 30° at initial contact',
          trunkFlexionCompensation: 'Excessive forward lean'
        }
      }
    ]
  },
  {
    code: 'KJMT',
    bodyRegion: 'Knee',
    tissueType: 'Joint / Cartilage',
    pathology: 'Medial Meniscus Tear (Repair / Partial Meniscectomy)',
    description: 'Disruption of the medial meniscus cartilage requiring suture repair or debridement.',
    commonSurgeries: ['Arthroscopic Medial Meniscus Repair', 'Partial Meniscectomy'],
    phases: [
      {
        phaseNumber: 1,
        phaseName: 'Protected Chondral & Suture Healing',
        weeks: '0 - 6 weeks',
        goals: 'Protect suture site from shear forces while restoring tissue tolerance.',
        clearanceCriteria: {
          weightBearing: 'Partial to Full weight-bearing as tolerated',
          kneeFlexion: 'Limited to ≤ 90° during loading'
        },
        riskThresholds: {
          deepFlexionCompressiveLoad: 'Avoid flexion > 90° under load',
          rotationalShear: 'No closed-chain rotation'
        }
      },
      {
        phaseNumber: 2,
        phaseName: 'Functional Quad Loading & Mobility',
        weeks: '6 - 12 weeks',
        goals: 'Normalize gait mechanics, restore full knee flexion ROM (135°+).',
        clearanceCriteria: {
          limbSymmetryIndex: '≥ 85%',
          squatDepth: 'Full bodyweight squat to 110°'
        },
        riskThresholds: {
          jointLineTenderness: 'Persistent medial pain',
          jointLocking: 'Mechanical catch'
        }
      }
    ]
  },
  {
    code: 'SJTC',
    bodyRegion: 'Shoulder',
    tissueType: 'Tendon',
    pathology: 'Rotator Cuff Full-Thickness Tear (Supraspinatus)',
    description: 'Complete detachment of the supraspinatus tendon from the greater tuberosity.',
    commonSurgeries: ['Arthroscopic Rotator Cuff Repair'],
    phases: [
      {
        phaseNumber: 1,
        phaseName: 'Passive Glenohumeral Mobility',
        weeks: '0 - 6 weeks',
        goals: 'Enable tendon-to-bone biological remodeling; prevent adhesive capsulitis.',
        clearanceCriteria: {
          passiveForwardFlexion: '140°',
          passiveExternalRotation: '45° in scapular plane',
          activeEngagement: '0% (Sling protection)'
        },
        riskThresholds: {
          subacromialShear: 'Active abduction strictly forbidden',
          scapularShrekking: 'Compensation during elevation'
        }
      },
      {
        phaseNumber: 2,
        phaseName: 'Dynamic Scapular Stabilization',
        weeks: '6 - 16 weeks',
        goals: 'Restore scapulohumeral rhythm; re-establish dynamic rotator cuff force coupling.',
        clearanceCriteria: {
          activeROM: 'Full active forward flexion',
          scapularRetractionSymmetry: '≥ 85%',
          rpeThreshold: '≤ 4/10'
        },
        riskThresholds: {
          scapularWinging: '> 2cm displacement',
          anteriorHeadMigration: 'Humeral head translation'
        }
      }
    ]
  },
  {
    code: 'AJLA',
    bodyRegion: 'Ankle',
    tissueType: 'Ligament',
    pathology: 'Anterior Talofibular Ligament (ATFL) Grade III Sprain',
    description: 'Complete rupture of the ATFL resulting from acute inversion force.',
    commonSurgeries: ['Broström-Gould Ligament Reconstruction', 'Conservative Immobilization'],
    phases: [
      {
        phaseNumber: 1,
        phaseName: 'Immobilization & Swelling Control',
        weeks: '0 - 3 weeks',
        goals: 'Protect ligamentous fibers, reduce edema, encourage gentle sagittal ROM.',
        clearanceCriteria: {
          dorsiflexionROM: '≥ 10° (knee flexed)',
          talarTiltTest: 'Grade 0/1'
        },
        riskThresholds: {
          inversionLoading: 'Strictly avoid forced inversion',
          peronealInhibition: 'Loss of lateral ankle stability'
        }
      }
    ]
  },
  {
    code: 'LSSM',
    bodyRegion: 'Lumbar Spine',
    tissueType: 'Muscle / Disc',
    pathology: 'Lumbar Disc Herniation & Paraspinal Myofascial Strain',
    description: 'Posterolateral disc protrusion with secondary paraspinal muscle spasm.',
    commonSurgeries: ['Conservative Physical Therapy', 'Microdiscectomy'],
    phases: [
      {
        phaseNumber: 1,
        phaseName: 'Core Stabilization & Neural Decompression',
        weeks: '0 - 4 weeks',
        goals: 'Centralize radicular symptoms, train transverse abdominis intra-abdominal pressure.',
        clearanceCriteria: {
          straightLegRaise: '≥ 70° without nerve root tension',
          plankHold: '≥ 45s with neutral spine'
        },
        riskThresholds: {
          lumbarFlexionUnderLoad: 'Avoid loaded end-range flexion',
          symptomPeripheralization: 'Radiation into foot'
        }
      }
    ]
  }
];

export const getTaxonomyByCode = (code) => {
  return INJURY_TAXONOMIES.find(t => t.code === code) || INJURY_TAXONOMIES[0];
};
